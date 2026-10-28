import { nextCmsBatchSession } from './cmsBatchSessions';
import { buildLepDueWeek } from './lepBatchDueWeek';
import { addCalendarDays, formatDateIST } from './lepBatchSchedule';
import { daysFromDay1, todayIsoIST } from './lepDailyPractice';
import {
  lepZohoCohortEndFromDay1,
  resolveLepBatchDateLine,
} from './lepDeskBatchDate';
import { lepAlumniBatchShort } from './lepAlumniUi';
import { learnerProgramDates } from './programAccess';
import { formatLepDay } from './registeredHomeData';

function cohortMemberCount(group) {
  if (!group) return null;
  if (typeof group.memberCount === 'number' && group.memberCount >= 0) return group.memberCount;
  if (Array.isArray(group.memberIds)) return group.memberIds.length;
  return null;
}

function resolveWhatsappUrl({ group, cmsBatch, profile }) {
  const lep = profile?.programAccess?.lep || {};
  return (
    String(
      group?.whatsappUrl ||
        group?.whatsappGroupUrl ||
        group?.waGroupUrl ||
        cmsBatch?.whatsappGroupUrl ||
        cmsBatch?.whatsappUrl ||
        lep.whatsappGroupUrl ||
        profile?.zohoLead?.WhatsApp_Group_Link ||
        profile?.zohoLead?.WA_Group_Link ||
        ''
    ).trim() || null
  );
}

/** Hero card + week list for My Program → Cohort. */
export function buildLepCohortView({ profile, cmsBatch, group, engagePosts = [] }) {
  const batchTitle =
    String(cmsBatch?.name || '').trim() ||
    lepAlumniBatchShort(profile) ||
    'Your cohort';

  const { dateLine } = resolveLepBatchDateLine({ profile, cmsBatch });
  const day1Iso =
    String(cmsBatch?.day1Date || learnerProgramDates(profile, 'lep').start || '').slice(0, 10) ||
    null;
  const endIso = day1Iso ? lepZohoCohortEndFromDay1(day1Iso) : '';

  const members = cohortMemberCount(group);
  const subParts = [];
  if (members != null && members > 0) {
    subParts.push(`${members} ${members === 1 ? 'woman' : 'women'} on the app`);
  }
  if (dateLine) subParts.push(`Batch ${dateLine}`);
  else if (day1Iso) {
    subParts.push(
      `Day 1 ${formatLepDay(day1Iso)}${endIso ? ` · through ${formatLepDay(endIso)}` : ''}`
    );
  }
  const today = todayIsoIST();
  const dayOffset = day1Iso ? daysFromDay1(today, day1Iso) : null;
  if (dayOffset != null && dayOffset >= 0) {
    subParts.push(`Day ${dayOffset + 1} of your cohort`);
  }

  const dueWeek = buildLepDueWeek(cmsBatch || (day1Iso ? { day1Date: day1Iso } : null));
  const nextLive = nextCmsBatchSession(cmsBatch || (day1Iso ? { day1Date: day1Iso } : null), new Date(), {
    day1Iso,
  });

  const weekRows = [];
  (dueWeek.items || []).slice(0, 3).forEach((item) => {
    weekRows.push({
      id: `due-${item.taskId || item.title}`,
      icon: item.icon || 'flag',
      title: item.title,
      meta: [item.kind || item.tag, item.due].filter(Boolean).join(' · '),
    });
  });

  if (nextLive?.title && weekRows.length < 4) {
    weekRows.push({
      id: `live-${nextLive.code || nextLive.title}`,
      icon: 'videocam',
      title: nextLive.title,
      meta: nextLive.meta || nextLive.doneMeta || 'Upcoming live session',
    });
  }

  (engagePosts || [])
    .filter((p) => p.kind === 'announcement' || p.kind === 'highlight')
    .slice(0, 2)
    .forEach((p) => {
      weekRows.push({
        id: `engage-${p.id}`,
        icon: 'campaign',
        title: p.title,
        meta: String(p.body || p.place || '').trim().slice(0, 100) || 'From your Iron Lady team',
      });
    });

  if (!weekRows.length) {
    weekRows.push({
      id: 'placeholder',
      icon: 'forum',
      title: 'Batch updates',
      meta: 'Live session reminders and team posts show here when your batch is linked.',
    });
  }

  const extraMembers =
    members != null && members > 4 ? Math.max(0, members - 4) : members != null && members > 0 ? 0 : null;

  return {
    batchTitle,
    subline: subParts.join(' · ') || 'Batch dates appear when your cohort is linked in CMS or Zoho.',
    memberCount: members,
    extraMemberLabel:
      extraMembers != null && extraMembers > 0
        ? `+${extraMembers}`
        : members != null && members > 0
          ? `${members} on the app`
          : null,
    weekSectionTitle: batchTitle ? `This week · ${batchTitle}` : 'This week in your cohort',
    weekRows,
    whatsappUrl: resolveWhatsappUrl({ group, cmsBatch, profile }),
    communityCircles: Array.isArray(cmsBatch?.communityCircles)
      ? cmsBatch.communityCircles.filter(Boolean)
      : null,
  };
}

/** Next Thursday 8 PM IST for Community Circle calendar deep link. */
export function nextCommunityCircleIso(from = new Date()) {
  const today = formatDateIST(from);
  const d = new Date(`${today}T12:00:00`);
  const dow = d.getDay();
  const daysUntilThu = (4 - dow + 7) % 7;
  const thu = addCalendarDays(today, daysUntilThu || 7);
  return thu;
}
