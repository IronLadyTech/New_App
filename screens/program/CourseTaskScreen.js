import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, ScrollView, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { openLink } from '../../utils/openLink';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IL_FONTS } from '../../constants/ironLadyBrand';
import ILText from '../../components/il/ILText';
import { G, af } from '../../constants/guestTheme';
import { LIQUID_TAB_PAD } from '../../components/il/LiquidTabBar';
import Pressable from '../../components/il/Press';
import { GuestBackBar } from '../guest/GuestBits';
import { Page, RedCta, WhiteCard } from '../lep/LepBits';
import { COURSE_LABEL, courseTask, nextCourseTask } from '../../constants/programCourseSlice';
import { PROGRAMS, TASK_TYPES } from '../../constants/programs';
import { useAuth } from '../../context/AuthContext';
import { useCourseDemo } from '../../context/CourseDemoContext';
import { usePrograms } from '../../context/ProgramsContext';
import { useLepNav } from '../lep/useLepNav';
import { useLearnerCmsBatch } from '../../hooks/useLearnerCmsBatch';
import { useLepRitualsUnlocked } from '../../hooks/useLepRitualsUnlocked';
import { isLepRitualsCourseTask } from '../../utils/lepRitualsUnlock';
import { isInAppDocument } from '../../utils/taskDocumentUri';
import EditableTemplateForm, {
  isGenericTemplateComplete,
} from '../../components/program/EditableTemplateForm';
import {
  getSubmitLabel,
  initialFormForTemplate,
  isTemplateComplete,
  TEMPLATE_IDS,
} from '../../constants/formTemplates';
import PracticeVideo from '../../components/program/PracticeVideo';
import { getVideoPoster } from '../../constants/preworkThumbs';
import { resolveTaskVideoUrl } from '../../utils/resolveVideoUrl';
import { fetchPublishedCmsForTask } from '../../services/cms';
import { pickTaskDocument, pickTaskVideo, uploadTaskSubmission } from '../../services/taskUploads';
import { showAlert } from '../../utils/showAlert';
import LEP_TASK_SCHEDULE from '../../constants/lepTaskSchedule.json';
import {
  TASK_MATERIALS_LOAD_FAILED,
  TASK_MATERIALS_PENDING,
  TASK_SAVE_FAILED,
} from '../../utils/learnerBatchDisplay';
import { todayIsoIST } from '../../utils/lepDailyPractice';
import { isProgramTaskDone, isSentBack } from '../../utils/taskDone';
import {
  isImageSubmissionFile,
  normalizeSubmissionFiles,
  submissionFileLabel,
} from '../../utils/taskSubmissionFiles';
import { lepTaskCategoryLabel, lepTaskInsideSteps, lepTaskPurpose, lepTaskWatchLabel } from '../../utils/lepTaskInsideCopy';
import LepTaskInsightFlipCard from '../../components/program/LepTaskInsightFlipCard';
import { resolveLepDay1Iso, resolveLepEnrolledCohortPhase } from '../../utils/lepEnrolledCohortPhase';
import {
  ALUMNI_PRACTICE_BANNER,
  alumniFlipGainFallback,
  alumniSubmitCta,
  alumniTaskSubtitle,
} from '../../utils/lepAlumniTaskCopy';

/** The sheet's "After" line for an LEP task (LEP-Messages-Complete-v6 → Task notifications). */
const LEP_AFTER_COPY = Object.fromEntries(LEP_TASK_SCHEDULE.tasks.map((t) => [t.id, t.after]));

/** Map journey UI state → LMS submitProgramTask fields. */
function lmsFieldsForJourneyTask(task, { text, link, form, checked, uploaded }) {
  const type = task?.type;
  if (type === TASK_TYPES.WATCH_ONLY) {
    return { watchCompleted: true, watchProgress: 1 };
  }
  if (type === TASK_TYPES.CHECKLIST) {
    return { checkedItems: checked };
  }
  if (type === TASK_TYPES.EDITABLE_TEMPLATE) {
    return { form };
  }
  if (type === TASK_TYPES.LINK || type === TASK_TYPES.RECURRING_POST) {
    return { linkValue: String(link || '').trim() };
  }
  if (type === TASK_TYPES.TEXT) {
    return { textValue: String(text || '').trim() };
  }
  if (type === TASK_TYPES.FILE_UPLOAD || type === TASK_TYPES.VIDEO_RECORD) {
    return uploaded || { note: 'Completed in app' };
  }
  return { note: 'Completed in app' };
}

/** VIA report + photos — each upload is saved on the same task (not a replace). */
function isMultiFileUploadTask(task) {
  return task?.type === TASK_TYPES.FILE_UPLOAD && task?.id === 'lep-via-survey';
}

function PickCard({ icon, title, sub, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        marginTop: 10,
        borderRadius: 18,
        padding: 16,
        backgroundColor: G.white,
        borderWidth: 1,
        borderColor: G.line,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: G.pink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} size={22} color={G.cta} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ILText role="label" color={G.ink}>
          {title}
        </ILText>
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 3, fontSize: 12 }}>
          {sub}
        </ILText>
      </View>
      <MaterialIcons name="chevron-right" size={18} color={G.meta} />
    </Pressable>
  );
}

// Videos open in the in-app player; other files as before (see utils/openLink).
function openTaskFile(url, navigation, title) {
  openLink(url, { navigation, title });
}

function fileKind(url, cmsType) {
  const type = String(cmsType || '').toLowerCase();
  if (type === 'image') return { icon: 'image', sub: 'Open image' };
  if (type === 'pdf') return { icon: 'picture-as-pdf', sub: 'Open document' };
  if (type === 'video') return { icon: 'play-circle-outline', sub: 'Open video' };
  const lower = String(url || '').toLowerCase();
  if (lower.includes('.pdf') || lower.includes('pdf')) return { icon: 'picture-as-pdf', sub: 'Open document' };
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return { icon: 'description', sub: 'Open template' };
  if (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(lower)) return { icon: 'image', sub: 'Open image' };
  return { icon: 'open-in-new', sub: 'Open file' };
}

function openTaskDocument(navigation, item) {
  const params = { url: item.url, label: item.title, pages: item.pages };
  const names = navigation.getState()?.routeNames || [];
  if (names.includes('TaskDocument')) navigation.navigate('TaskDocument', params);
  else navigation.navigate('MyProgram', { screen: 'TaskDocument', params });
}

function TaskFiles({ task, skipReadingDocument = false }) {
  const navigation = useNavigation();
  const items = [];
  const seen = new Set();
  const add = (item, fallback) => {
    if (!item?.url || seen.has(item.url)) return;
    seen.add(item.url);
    const kind = fileKind(item.url, item.cmsType);
    items.push({
      url: item.url,
      title: item.label || item.title,
      pages: item.pages,
      icon: kind.icon,
      sub: fallback || (isInAppDocument(item.url) ? 'Read in app' : kind.sub),
    });
  };

  if (task.readingDocument && !skipReadingDocument) {
    const pages = task.readingDocument.pages;
    add(
      task.readingDocument,
      pages?.length ? `Read in app · page ${pages.join(', ')}` : 'Read in app'
    );
  }
  (task.resourceLinks || []).forEach((link) => add(link));
  if (!items.length) return null;

  return (
    <View style={{ marginTop: 18 }}>
      <ILText role="label" color={G.ink} style={{ marginBottom: 4 }}>
        Batch materials
      </ILText>
      {items.map((item) => (
        <PickCard
          key={item.url}
          icon={item.icon}
          title={item.title}
          sub={item.sub}
          onPress={() =>
            isInAppDocument(item.url)
              ? openTaskDocument(navigation, item)
              : openTaskFile(item.url, navigation, item.title)
          }
        />
      ))}
    </View>
  );
}

function ChosenChip({ label }) {
  return (
    <View
      style={{
        marginTop: 12,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: G.pink,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <MaterialIcons name="check-circle" size={18} color={G.cta} />
      <ILText role="label" color={G.ink} style={{ marginLeft: 8, flex: 1, fontSize: 13 }}>
        {label}
      </ILText>
    </View>
  );
}

function chosenLabel(picked) {
  const size = picked?.size ? ` · ${(picked.size / (1024 * 1024)).toFixed(1)} MB` : '';
  return `${picked?.name || 'Chosen file'}${size}`;
}

function hasSubmissionContent(sub) {
  if (!sub) return false;
  if (normalizeSubmissionFiles(sub).length > 0) return true;
  if (String(sub.textValue || '').trim()) return true;
  if (String(sub.linkValue || '').trim()) return true;
  if (sub.form && typeof sub.form === 'object' && Object.keys(sub.form).length > 0) return true;
  if (Array.isArray(sub.checkedItems) && sub.checkedItems.length > 0) return true;
  if (sub.watchCompleted) return true;
  return false;
}

/** What she already handed in — each file on its own row; photos show a thumbnail. */
function SubmittedFilesList({ submission, navigation, title }) {
  const files = normalizeSubmissionFiles(submission);
  if (!files.length) return null;
  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      {files.map((file) => {
        const label = submissionFileLabel(file);
        const image = isImageSubmissionFile(file);
        return (
          <Pressable
            key={file.url}
            onPress={() => openTaskFile(file.url, navigation, title || label)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${label}`}
            style={{
              borderRadius: 14,
              padding: image ? 10 : 12,
              backgroundColor: G.pink,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {image ? (
              <Image
                source={{ uri: file.url }}
                style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: G.line }}
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="insert-drive-file" size={22} color={G.cta} />
            )}
            <ILText role="label" color={G.ink} style={{ marginLeft: image ? 12 : 8, flex: 1, fontSize: 13 }}>
              {label}
            </ILText>
            <MaterialIcons name="chevron-right" size={18} color={G.meta} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Where CX's review stands: 'approved' | 'reviewing' | 'sentBack' | 'submitted' | null. */
function reviewStateOf(sub) {
  if (!sub) return null;
  const s = sub?.status;
  if (s === 'completed') return 'approved';
  if (s === 'under_review') return 'reviewing';
  if (isSentBack(s)) return 'sentBack';
  if (s === 'submitted') return 'submitted';
  if (hasSubmissionContent(sub) && sub.submittedAt) return 'submitted';
  return null;
}

function reviewDate(sub) {
  const t = sub?.reviewedAt;
  const ms = t?.toMillis ? t.toMillis() : t?.seconds ? t.seconds * 1000 : Date.parse(t || '');
  return Number.isFinite(ms) ? new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '';
}

/** CX's feedback on her work, in the app — the same words she would read in the LMS. */
function ReviewCard({ state, sub }) {
  const feedback = String(sub?.feedback || '').trim();
  if (state !== 'sentBack' && !(state === 'approved' && feedback)) return null;
  const sentBack = state === 'sentBack';
  const when = reviewDate(sub);
  return (
    <View
      style={{
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        backgroundColor: sentBack ? '#FFF4D6' : '#E3F1EA',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name={sentBack ? 'rate-review' : 'verified'} size={20} color={sentBack ? '#9A5B00' : '#1F7A4D'} />
        <ILText role="label" color={G.ink} style={{ marginLeft: 8, flex: 1 }}>
          {sentBack ? 'Your CX asked for a few changes' : 'Feedback from your CX'}
          {when ? ` · ${when}` : ''}
        </ILText>
      </View>
      {feedback ? (
        <ILText role="body" color={G.ink} style={{ marginTop: 8, fontSize: 14, lineHeight: 21 }}>
          “{feedback}”
        </ILText>
      ) : null}
      {sentBack ? (
        <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 12 }}>
          Your last answer is below — change what is needed and resubmit.
        </ILText>
      ) : null}
    </View>
  );
}

function reviewHeadline(review) {
  if (review === 'approved') return 'Approved by your CX';
  if (review === 'reviewing') return 'Your CX is reviewing this — it can’t be changed now';
  if (review === 'sentBack') return 'Your CX asked for changes — resubmit when ready';
  return 'Submitted — waiting for your CX to review';
}

/** Pink status row after submit — same on every task type. */
function TaskReviewStatusBanner({ review, programId, taskId }) {
  const headline = reviewHeadline(review);
  return (
    <View
      style={{
        borderRadius: 18,
        padding: 16,
        backgroundColor: G.pink,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      }}
    >
      <MaterialIcons name="check-circle" size={20} color={G.cta} />
      <View style={{ marginLeft: 8, flex: 1 }}>
        <ILText role="label" color={G.ink}>
          {headline}
        </ILText>
        {programId === PROGRAMS.LEP && LEP_AFTER_COPY[taskId] ? (
          <ILText role="bodySm" color={G.ink} style={{ marginTop: 2, fontSize: 13, lineHeight: 18 }}>
            {LEP_AFTER_COPY[taskId]}
          </ILText>
        ) : null}
      </View>
    </View>
  );
}

export default function CourseTaskScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const nav = useLepNav();
  const demo = useCourseDemo();
  const { profile, user } = useAuth();
  const { getTaskSubmission, submitTask } = usePrograms();
  const programId = route.params?.programId || PROGRAMS.LEP;
  const taskId = route.params?.taskId;
  const { batch: cmsBatch } = useLearnerCmsBatch(programId === PROGRAMS.LEP ? 'lep' : 'lep');
  const cmsBatchId = cmsBatch?.id || null;
  const day1Iso = resolveLepDay1Iso(profile, cmsBatch);
  const cohortAlumni =
    programId === PROGRAMS.LEP && resolveLepEnrolledCohortPhase(profile, day1Iso) === 'alumni';
  const alumniPractice = route.params?.alumniPractice === true || cohortAlumni;
  const { unlocked: ritualsUnlocked } = useLepRitualsUnlocked({ cmsBatch });
  const task = courseTask(programId, taskId);
  const ritualsTaskLocked =
    programId === PROGRAMS.LEP &&
    taskId &&
    isLepRitualsCourseTask(taskId) &&
    !ritualsUnlocked &&
    !alumniPractice;
  const next = nextCourseTask(programId, taskId);

  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [form, setForm] = useState({});
  const [checked, setChecked] = useState([]);
  /** { uri, name, mimeType, size } chosen for a file / video task — uploaded on Submit. */
  const [picked, setPicked] = useState(null);
  const [uploadPct, setUploadPct] = useState(null);
  // Furthest point watched (0–1), and whether playback started — "Mark watched" waits for 90%.
  const [watchMax, setWatchMax] = useState(null);
  const [watchStarted, setWatchStarted] = useState(false);
  const [watchUntracked, setWatchUntracked] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [done, setDone] = useState(false);
  // "Edit and resubmit" on work not yet reviewed reopens the form.
  const [editing, setEditing] = useState(false);
  const submission = getTaskSubmission(programId, taskId);
  const review = reviewStateOf(submission);
  const displayReview =
    review ||
    (hasSubmissionContent(submission) && (submission?.submittedAt || done) ? 'submitted' : null);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [cmsLinks, setCmsLinks] = useState([]);
  const [cmsHint, setCmsHint] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!taskId) return undefined;
    let cancelled = false;
    setCmsHint(null);
    fetchPublishedCmsForTask(programId, taskId, cmsBatchId)
      .then((rows) => {
        if (cancelled) return;
        const links = rows
          .filter((r) => r.url)
          .map((r) => ({
            label: r.title || 'Open file',
            url: r.url,
            cmsType: r.type,
          }));
        setCmsLinks(links);
        if (!links.length && taskId === 'lep-orientation-schedule') {
          setCmsHint(TASK_MATERIALS_PENDING);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setCmsLinks([]);
          const code = e?.code || '';
          if (code === 'permission-denied') {
            setCmsHint(TASK_MATERIALS_LOAD_FAILED);
          }
        }
      });
    return () => {
      cancelled = true;
    };
  }, [programId, taskId, cmsBatchId]);

  const taskForFiles = useMemo(() => {
    if (!task) return task;
    if (!cmsLinks.length) return task;
    return { ...task, resourceLinks: [...(task.resourceLinks || []), ...cmsLinks] };
  }, [task, cmsLinks]);

  const isErrcTask = task?.templateId === TEMPLATE_IDS.ERRC;
  const videoPoster = getVideoPoster({ taskId, uri: videoUri });
  const lepInside =
    programId === PROGRAMS.LEP && task
      ? {
          category: lepTaskCategoryLabel(task),
          steps: lepTaskInsideSteps(task),
          purpose: lepTaskPurpose(taskId),
        }
      : null;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!task) return;
      const uri = await resolveTaskVideoUrl(task);
      if (mounted) setVideoUri(uri);
    })();
    return () => {
      mounted = false;
    };
  }, [task]);

  useEffect(() => {
    setText('');
    setLink('');
    setChecked([]);
    setPicked(null);
    setUploadPct(null);
    setWatchMax(null);
    setWatchStarted(false);
    setWatchUntracked(false);

    const saved = isErrcTask ? demo.getSubmission(programId, taskId) : null;
    const savedErrcOk =
      saved?.data?.rows?.length &&
      saved.data.rows[0]?.task !== undefined &&
      Array.isArray(saved.data.activities);
    if (saved?.data && (!isErrcTask || savedErrcOk)) {
      setForm(saved.data);
      setSubmittedAt(saved.submittedAt || null);
    } else if (saved?.data && isErrcTask && saved.data.rows?.[0]?.task !== undefined) {
      setForm({
        ...saved.data,
        activities: initialFormForTemplate(TEMPLATE_IDS.ERRC).activities,
      });
      setSubmittedAt(saved.submittedAt || null);
    } else {
      setForm(initialFormForTemplate(task?.templateId) || {});
      setSubmittedAt(null);
    }
    setDone(
      isProgramTaskDone(programId, taskId, {
        isDone: demo.isDone,
        getTaskSubmission,
      })
    );
    setEditing(false);
  }, [programId, taskId, task?.templateId, demo.isDone, demo.done, getTaskSubmission]);

  // Sent back, or editing before review: start from what she handed in, not a blank form.
  const prefillKey = `${taskId}|${review}|${editing}`;
  useEffect(() => {
    if (!submission || (review !== 'sentBack' && !editing)) return;
    if (submission.textValue) setText(submission.textValue);
    if (submission.linkValue) setLink(submission.linkValue);
    if (Array.isArray(submission.checkedItems)) setChecked(submission.checkedItems);
    const savedForm = submission.form || submission.templateData;
    if (savedForm && typeof savedForm === 'object') setForm(savedForm);
  }, [prefillKey]);

  // Some players (an old YouTube embed) report no progress — never leave the learner stuck.
  useEffect(() => {
    if (!watchStarted || watchMax !== null) return undefined;
    const t = setTimeout(() => setWatchUntracked(true), 30000);
    return () => clearTimeout(t);
  }, [watchStarted, watchMax]);

  const pickFile = async (source) => {
    try {
      const chosen = source === 'file' ? await pickTaskDocument() : await pickTaskVideo(source);
      if (chosen) setPicked(chosen);
    } catch (e) {
      showAlert(e?.code === 'permission' ? 'Permission needed' : 'Could not use that file', e?.message || 'Try again.');
    }
  };

  const submit = async () => {
    if (syncing || !task?.id) return;
    setSyncing(true);
    try {
      let uploaded = null;
      const isUpload = task.type === TASK_TYPES.FILE_UPLOAD || task.type === TASK_TYPES.VIDEO_RECORD;
      // Preview / demo learners have no Storage folder; real learners always upload.
      if (isUpload && picked && user?.uid && user.uid !== 'preview') {
        setUploadPct(0);
        uploaded = await uploadTaskSubmission({
          programId,
          userId: user.uid,
          taskId: task.id,
          kind: task.type === TASK_TYPES.VIDEO_RECORD ? 'video' : 'file',
          picked,
          onProgress: setUploadPct,
        });
      }
      await submitTask(
        programId,
        task,
        lmsFieldsForJourneyTask(task, { text, link, form, checked, uploaded })
      );
      if (isErrcTask) {
        demo.saveSubmission(programId, taskId, form);
        setSubmittedAt(Date.now());
      }
      demo.markDone(programId, taskId);
      if (programId === 'lep') {
        demo.recordLepActiveDay?.(todayIsoIST());
      }
      setDone(true);
      setEditing(false);
      setPicked(null);
    } catch (e) {
      showAlert(
        'Not saved yet',
        e?.message && !String(e.message).toLowerCase().includes('zoho')
          ? `${TASK_SAVE_FAILED}\n\n(${e.message})`
          : TASK_SAVE_FAILED
      );
    } finally {
      setSyncing(false);
      setUploadPct(null);
    }
  };

  if (!task || ritualsTaskLocked) {
    return (
      <Page>
        <StatusBar style="dark" />
        <View style={{ paddingTop: Math.max(insets.top, 8) }}>
          <GuestBackBar
            title="Task"
            sub={ritualsTaskLocked ? 'Locked' : 'Not found'}
            onBack={() => navigation.goBack()}
          />
        </View>
        {ritualsTaskLocked ? (
          <ILText role="body" color={G.meta} align="center" style={{ marginTop: 40, paddingHorizontal: 24 }}>
            The 5 Daily Rituals unlock after your Day 1 and Day 2 sessions (from Monday of Week 1).
          </ILText>
        ) : null}
      </Page>
    );
  }

  const type = task.type;
  const multiFileUpload = isMultiFileUploadTask(task);
  const canAddAnotherFile =
    multiFileUpload && done && !editing && displayReview === 'submitted';
  const showReviewBanner = Boolean(displayReview && hasSubmissionContent(submission));
  const items = task.checklistItems || [];
  // Watched 90%, or the player cannot report progress (never strand her).
  const canMarkWatched = !!videoUri && ((watchMax || 0) >= 0.9 || watchUntracked);
  const ready =
    type === TASK_TYPES.TEXT
      ? !!text.trim()
      : type === TASK_TYPES.LINK || type === TASK_TYPES.RECURRING_POST
        ? !!link.trim()
        : type === TASK_TYPES.CHECKLIST
          ? items.length > 0 && checked.length >= items.length
          : type === TASK_TYPES.WATCH_ONLY
            ? canMarkWatched
            : type === TASK_TYPES.EDITABLE_TEMPLATE
              ? task.templateId
                ? isTemplateComplete(task.templateId, form)
                : isGenericTemplateComplete(form)
              : !!picked; // file / video: a (re)submission needs a file chosen now

  const baseCta =
    type === TASK_TYPES.WATCH_ONLY
      ? 'Mark watched'
      : type === TASK_TYPES.VIDEO_RECORD
        ? 'Submit video'
        : type === TASK_TYPES.FILE_UPLOAD
          ? 'Submit file'
          : type === TASK_TYPES.EDITABLE_TEMPLATE
            ? isErrcTask && done
              ? 'Resubmit ERRC table'
              : task.templateId
                ? getSubmitLabel(task.templateId)
                : 'Submit form'
            : type === TASK_TYPES.CHECKLIST
              ? 'Submit checklist'
              : type === TASK_TYPES.LINK || type === TASK_TYPES.RECURRING_POST
                ? 'Submit link'
                : 'Submit answer';
  const cta =
    review === 'sentBack' || editing ? 'Resubmit' : alumniPractice ? alumniSubmitCta(baseCta) : baseCta;

  const submittedLabel =
    submittedAt
      ? alumniPractice
        ? `Last refresh ${new Date(submittedAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}`
        : `Submitted ${new Date(submittedAt).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}`
      : alumniPractice
        ? 'Practice saved'
        : 'Submitted';

  const goNext = () => {
    if (next) nav.goCourseTask(programId, next.id);
    else navigation.goBack();
  };

  return (
    <Page>
      <StatusBar style="dark" />
      <View style={{ paddingTop: Math.max(insets.top, 8) }}>
        <GuestBackBar
          title={task.title}
          sub={
            alumniPractice
              ? alumniTaskSubtitle(task)
              : `${COURSE_LABEL[programId]} · ${task.kind}${task.week ? ` · ${task.week}` : ''}`
          }
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: LIQUID_TAB_PAD + Math.max(insets.bottom, 8),
        }}
      >
        <ILText role="eyebrow" color={G.cta} style={[af, { marginTop: 8, fontSize: 10 }]}>
          {alumniPractice ? 'Alumni monthly practice' : task.kind}
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
        >
          {task.title}
        </ILText>
        {alumniPractice ? (
          <WhiteCard style={{ marginTop: 12, borderRadius: 16, padding: 14, backgroundColor: G.pink }}>
            <ILText role="bodySm" color={G.body} style={{ fontSize: 14, lineHeight: 20 }}>
              {ALUMNI_PRACTICE_BANNER}
            </ILText>
          </WhiteCard>
        ) : null}

        {!(lepInside?.steps?.length) && task.description ? (
          <ILText role="body" color={G.body} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
            {alumniPractice
              ? 'Use the same steps you did in LEP — update your answers for where you are now.'
              : task.description}
          </ILText>
        ) : null}

        {lepInside?.steps?.length ? (
          <LepTaskInsightFlipCard
            backgroundColor={G.pink}
            front={{
              eyebrow: alumniPractice
                ? "What you'll gain from this refresh"
                : "What you'll have when you're done",
              content: (
                <>
                  {lepInside.purpose?.why ? (
                    <ILText role="bodySm" color={G.body} style={{ fontSize: 14, lineHeight: 20, marginBottom: 10 }}>
                      {lepInside.purpose.why}
                    </ILText>
                  ) : null}
                  <ILText role="body" color={G.ink} style={{ fontSize: 15, lineHeight: 22 }}>
                    {lepInside.purpose?.gain ||
                      (alumniPractice
                        ? alumniFlipGainFallback()
                        : 'Finish this task so you can keep moving through your LEP journey.')}
                  </ILText>
                </>
              ),
            }}
            back={{
              eyebrow: alumniPractice
                ? `How to do this refresh · ${lepInside.category}`
                : `How to complete it · ${lepInside.category}`,
              content: (
                <>
                  {lepInside.steps.map((line, idx) => (
                    <ILText
                      key={idx}
                      role="bodySm"
                      color={G.ink}
                      style={{ marginTop: idx === 0 ? 0 : 8, fontSize: 14, lineHeight: 20 }}
                    >
                      {idx + 1}. {line}
                    </ILText>
                  ))}
                </>
              ),
            }}
          />
        ) : null}

        <TaskFiles task={taskForFiles} skipReadingDocument={isErrcTask} />
        {cmsHint && !cmsLinks.length ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 14, fontSize: 13, lineHeight: 18 }}>
            {cmsHint}
          </ILText>
        ) : null}

        {videoUri && type !== TASK_TYPES.WATCH_ONLY ? (
          <View style={{ marginTop: 18 }}>
            <ILText role="label" color={G.ink} style={{ marginBottom: 8 }}>
              {lepTaskWatchLabel(taskId)}
            </ILText>
            <PracticeVideo uri={videoUri} poster={videoPoster} height={200} trackKey={`${programId}:${taskId}`} />
          </View>
        ) : null}

        {type === TASK_TYPES.TEXT ? (
          <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 14 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={task.placeholder || 'Type your answer'}
              placeholderTextColor="#B8B4A8"
              multiline
              style={{
                minHeight: 140,
                fontFamily: IL_FONTS.regular,
                fontSize: 15,
                color: G.ink,
              }}
            />
          </WhiteCard>
        ) : null}

        {type === TASK_TYPES.LINK || type === TASK_TYPES.RECURRING_POST ? (
          <WhiteCard style={{ marginTop: 18, borderRadius: 18, padding: 14 }}>
            <TextInput
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              placeholder={task.linkLabel || 'https://'}
              placeholderTextColor="#B8B4A8"
              style={{ fontFamily: IL_FONTS.regular, fontSize: 15, color: G.ink }}
            />
          </WhiteCard>
        ) : null}

        {type === TASK_TYPES.WATCH_ONLY ? (
          <View style={{ marginTop: 18 }}>
            {videoUri ? (
              <PracticeVideo
                uri={videoUri}
                poster={videoPoster}
                height={210}
                trackKey={`${programId}:${taskId}`}
                onStart={() => setWatchStarted(true)}
                onProgress={(f) => setWatchMax((m) => Math.max(m || 0, f))}
              />
            ) : (
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 13 }}>
                Loading session recording…
              </ILText>
            )}
            {!canMarkWatched && videoUri && !done ? (
              <ILText role="bodySm" color={G.meta} align="center" style={{ marginTop: 10, fontSize: 12 }}>
                {watchMax
                  ? `Watched ${Math.round(watchMax * 100)}% — keep going to mark it watched.`
                  : 'Watch the video to mark it watched.'}
              </ILText>
            ) : null}
          </View>
        ) : null}

        {type === TASK_TYPES.CHECKLIST ? (
          <WhiteCard style={{ marginTop: 18, borderRadius: 18, paddingHorizontal: 14 }}>
            {items.map((item, i) => {
              const on = checked.includes(item);
              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    setChecked((prev) =>
                      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                    )
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderBottomWidth: i === items.length - 1 ? 0 : 1,
                    borderBottomColor: G.line,
                  }}
                >
                  <MaterialIcons
                    name={on ? 'check-circle' : 'radio-button-unchecked'}
                    size={22}
                    color={on ? G.ink : '#C8C4B6'}
                  />
                  <ILText role="label" color={G.ink} style={{ flex: 1, marginLeft: 12, fontSize: 14 }}>
                    {item}
                  </ILText>
                </Pressable>
              );
            })}
          </WhiteCard>
        ) : null}

        {type === TASK_TYPES.VIDEO_RECORD ? (
          <View style={{ marginTop: 8 }}>
            {Platform.OS !== 'web' ? (
              <PickCard
                icon="videocam"
                title="Record video"
                sub="Use the camera on this phone · up to 5 min"
                onPress={() => pickFile('camera')}
              />
            ) : null}
            <PickCard
              icon="video-library"
              title="Choose from library"
              sub="Pick a video already on this phone · up to 200 MB"
              onPress={() => pickFile('library')}
            />
            {picked ? <ChosenChip label={chosenLabel(picked)} /> : null}
            <SubmittedFilesList
              submission={getTaskSubmission(programId, taskId)}
              navigation={navigation}
              title={task.title}
            />
          </View>
        ) : null}

        {type === TASK_TYPES.FILE_UPLOAD ? (
          <View style={{ marginTop: 8 }}>
            <PickCard
              icon="attach-file"
              title="Choose file"
              sub={
                taskId === 'lep-via-survey'
                  ? 'Add your VIA report and each photo · up to 15 MB each'
                  : 'PDF, Word or photo · up to 15 MB'
              }
              onPress={() => pickFile('file')}
            />
            {taskId === 'lep-via-survey' ? (
              <ILText role="bodySm" color={G.meta} style={{ marginTop: 8, fontSize: 12, lineHeight: 17 }}>
                Submit each file once — your report and all three photos stay on this task.
              </ILText>
            ) : null}
            {picked ? <ChosenChip label={chosenLabel(picked)} /> : null}
            <SubmittedFilesList
              submission={getTaskSubmission(programId, taskId)}
              navigation={navigation}
              title={task.title}
            />
          </View>
        ) : null}

        {type === TASK_TYPES.EDITABLE_TEMPLATE ? (
          <EditableTemplateForm templateId={task.templateId} form={form} setForm={setForm} />
        ) : null}

        <View style={{ marginTop: 22 }}>
          {showReviewBanner ? (
            <TaskReviewStatusBanner
              review={displayReview || 'submitted'}
              programId={programId}
              taskId={taskId}
            />
          ) : null}
          <ReviewCard state={displayReview} sub={submission} />

          {canAddAnotherFile ? (
            <>
              {picked ? (
                <View style={{ opacity: !syncing ? 1 : 0.45, marginBottom: 12 }}>
                  <RedCta
                    label={
                      syncing
                        ? uploadPct !== null
                          ? `Uploading ${uploadPct}%…`
                          : 'Saving…'
                        : 'Submit this file'
                    }
                    onPress={!syncing ? submit : () => {}}
                  />
                </View>
              ) : null}
              <RedCta
                label={next ? `Next task · ${next.title}` : 'Back to this phase'}
                onPress={goNext}
              />
              {displayReview === 'submitted' ? (
                <Pressable
                  onPress={() => setEditing(true)}
                  accessibilityRole="button"
                  style={{
                    marginTop: 12,
                    borderRadius: 999,
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: G.line,
                    backgroundColor: G.white,
                  }}
                >
                  <ILText role="label" color={G.ink}>
                    Edit and resubmit
                  </ILText>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {done && !editing && !canAddAnotherFile && isErrcTask ? (
            <>
              <RedCta
                label={next ? `Next task · ${next.title}` : 'Back to this phase'}
                onPress={goNext}
              />
              {displayReview === 'submitted' ? (
                <Pressable
                  onPress={() => setEditing(true)}
                  accessibilityRole="button"
                  style={{
                    marginTop: 12,
                    borderRadius: 999,
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: G.line,
                    backgroundColor: G.white,
                  }}
                >
                  <ILText role="label" color={G.ink}>
                    Edit and resubmit
                  </ILText>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {done && !editing && !canAddAnotherFile && !isErrcTask ? (
            <>
              <RedCta
                label={next ? `Next task · ${next.title}` : 'Back to this phase'}
                onPress={goNext}
              />
              {displayReview === 'submitted' && type !== TASK_TYPES.WATCH_ONLY ? (
                <Pressable
                  onPress={() => setEditing(true)}
                  accessibilityRole="button"
                  style={{
                    marginTop: 12,
                    borderRadius: 999,
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: G.line,
                    backgroundColor: G.white,
                  }}
                >
                  <ILText role="label" color={G.ink}>
                    Edit and resubmit
                  </ILText>
                </Pressable>
              ) : null}
            </>
          ) : null}

          {!done || editing ? (
            <>
              {!canAddAnotherFile ? (
                <View style={{ opacity: ready && !syncing ? 1 : 0.45 }}>
                  <RedCta
                    label={syncing ? (uploadPct !== null ? `Uploading ${uploadPct}%…` : 'Saving…') : cta}
                    onPress={ready && !syncing ? submit : () => {}}
                  />
                </View>
              ) : null}
              {done && isErrcTask ? (
                <Pressable
                  onPress={goNext}
                  style={{
                    marginTop: 12,
                    borderRadius: 999,
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: G.line,
                    backgroundColor: G.white,
                  }}
                >
                  <ILText role="label" color={G.ink}>
                    {next ? `Next task · ${next.title}` : 'Back to this phase'}
                  </ILText>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </Page>
  );
}
