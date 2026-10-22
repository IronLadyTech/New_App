import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, TextInput, View } from 'react-native';
import * as Linking from 'expo-linking';
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
import { todayIsoIST } from '../../utils/lepDailyPractice';
import { isProgramTaskDone } from '../../utils/taskDone';

/** Map journey UI state → LMS submitProgramTask fields. */
function lmsFieldsForJourneyTask(task, { text, link, form, checked, picked }) {
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
    return { note: picked || 'Completed in app' };
  }
  return { note: 'Completed in app' };
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

export default function CourseTaskScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const nav = useLepNav();
  const demo = useCourseDemo();
  const { getTaskSubmission, submitTask } = usePrograms();
  const programId = route.params?.programId || PROGRAMS.LEP;
  const taskId = route.params?.taskId;
  const { batch: cmsBatch } = useLearnerCmsBatch(programId === PROGRAMS.LEP ? 'lep' : 'lep');
  const cmsBatchId = cmsBatch?.id || null;
  const { unlocked: ritualsUnlocked } = useLepRitualsUnlocked({ cmsBatch });
  const task = courseTask(programId, taskId);
  const ritualsTaskLocked =
    programId === PROGRAMS.LEP && taskId && isLepRitualsCourseTask(taskId) && !ritualsUnlocked;
  const next = nextCourseTask(programId, taskId);

  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [form, setForm] = useState({});
  const [checked, setChecked] = useState([]);
  const [picked, setPicked] = useState('');
  const [watched, setWatched] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [done, setDone] = useState(false);
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
          setCmsHint(
            'No schedule file yet. In CMS → Content library, set Task IDs to lep-orientation-schedule or T12 and turn Live on.'
          );
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setCmsLinks([]);
          const code = e?.code || '';
          if (code === 'permission-denied') {
            setCmsHint('Could not load materials (permissions). Deploy latest Firestore rules, then reload.');
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
    setPicked('');
    setWatched(false);

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
  }, [programId, taskId, task?.templateId, demo.isDone, demo.done, getTaskSubmission]);

  const submit = async () => {
    if (syncing || !task?.id) return;
    setSyncing(true);
    try {
      await submitTask(
        programId,
        task,
        lmsFieldsForJourneyTask(task, { text, link, form, checked, picked })
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
    } catch (e) {
      Alert.alert(
        'Not saved yet',
        e?.message
          ? `LMS sync failed: ${e.message}\n\nYour answers are still here — tap Submit again when you're back online.`
          : "LMS sync failed. Tap Submit again when you're back online."
      );
    } finally {
      setSyncing(false);
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
  const items = task.checklistItems || [];
  const ready =
    type === TASK_TYPES.TEXT
      ? !!text.trim()
      : type === TASK_TYPES.LINK || type === TASK_TYPES.RECURRING_POST
        ? !!link.trim()
        : type === TASK_TYPES.CHECKLIST
          ? items.length > 0 && checked.length >= items.length
          : type === TASK_TYPES.WATCH_ONLY
            ? watched
            : type === TASK_TYPES.EDITABLE_TEMPLATE
              ? task.templateId
                ? isTemplateComplete(task.templateId, form)
                : isGenericTemplateComplete(form)
              : !!picked || done;

  const cta =
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

  const submittedLabel =
    submittedAt
      ? `Submitted ${new Date(submittedAt).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}`
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
          sub={`${COURSE_LABEL[programId]} · ${task.kind}${task.week ? ` · ${task.week}` : ''}`}
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
          {task.kind}
        </ILText>
        <ILText
          role="display"
          color={G.ink}
          style={{ marginTop: 8, fontFamily: IL_FONTS.display, fontSize: 28, lineHeight: 34 }}
        >
          {task.title}
        </ILText>
        <ILText role="body" color={G.body} style={{ marginTop: 10, fontSize: 15, lineHeight: 22 }}>
          {task.description}
        </ILText>

        <TaskFiles task={taskForFiles} skipReadingDocument={isErrcTask} />
        {cmsHint && !cmsLinks.length ? (
          <ILText role="bodySm" color={G.meta} style={{ marginTop: 14, fontSize: 13, lineHeight: 18 }}>
            {cmsHint}
          </ILText>
        ) : null}

        {videoUri && type !== TASK_TYPES.WATCH_ONLY ? (
          <View style={{ marginTop: 18 }}>
            <ILText role="label" color={G.ink} style={{ marginBottom: 8 }}>
              Watch first
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
              <PracticeVideo uri={videoUri} poster={videoPoster} height={210} trackKey={`${programId}:${taskId}`} />
            ) : (
              <ILText role="bodySm" color={G.meta} style={{ fontSize: 13 }}>
                Loading session recording…
              </ILText>
            )}
            <Pressable
              onPress={() => videoUri && setWatched(true)}
              accessibilityRole="button"
              style={{
                marginTop: 12,
                borderRadius: 999,
                paddingVertical: 14,
                backgroundColor: watched ? G.dark : videoUri ? G.cta : G.dash,
                alignItems: 'center',
              }}
            >
              <ILText role="label" color="#FFFFFF">
                {watched ? 'Marked watched' : 'Mark watched'}
              </ILText>
            </Pressable>
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
            <PickCard
              icon="videocam"
              title="Record video"
              sub="Use the camera on this phone"
              onPress={() => setPicked('Recorded just now · 0:42')}
            />
            <PickCard
              icon="video-library"
              title="Choose from library"
              sub="Pick a video already on this phone"
              onPress={() => setPicked(`${task.title}.mov`)}
            />
            {picked ? <ChosenChip label={picked} /> : null}
          </View>
        ) : null}

        {type === TASK_TYPES.FILE_UPLOAD ? (
          <View style={{ marginTop: 8 }}>
            <PickCard
              icon="attach-file"
              title="Choose file"
              sub="PDF or Word · demo pick"
              onPress={() => setPicked(`${task.title}.pdf`)}
            />
            {picked ? <ChosenChip label={picked} /> : null}
          </View>
        ) : null}

        {type === TASK_TYPES.EDITABLE_TEMPLATE ? (
          <EditableTemplateForm templateId={task.templateId} form={form} setForm={setForm} />
        ) : null}

        <View style={{ marginTop: 22 }}>
          {done && isErrcTask ? (
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
              <ILText role="label" color={G.ink} style={{ marginLeft: 8, flex: 1 }}>
                {submittedLabel}
              </ILText>
            </View>
          ) : null}

          {done && !isErrcTask ? (
            <>
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
                <ILText role="label" color={G.ink} style={{ marginLeft: 8 }}>
                  Submitted
                </ILText>
              </View>
              <RedCta
                label={next ? `Next task · ${next.title}` : 'Back to this phase'}
                onPress={goNext}
              />
            </>
          ) : (
            <>
              <View style={{ opacity: ready && !syncing ? 1 : 0.45 }}>
                <RedCta
                  label={syncing ? 'Saving…' : cta}
                  onPress={ready && !syncing ? submit : () => {}}
                />
              </View>
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
          )}
        </View>
      </ScrollView>
    </Page>
  );
}
