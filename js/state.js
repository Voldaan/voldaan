export const STORAGE_KEY = 'voldaan.state.v1';

export const defaultState = {
  meta: {
    version: 1,
    lastUpdated: null,
    lastBackupAt: null,
  },
  settings: {
    theme: 'light',
    activeTab: 'today',
  },
  moodHistory: [],
  marbleHistory: [],
  taskList: [],
  goalList: [],
  contacts: [],
  ideas: [],
  projects: [],
  money: {
    bills: [],
    anchors: [],
    impulseList: [],
    studyDebt: null,
  },
  habits: {
    sleep: null,
    steps: null,
    smokeCount: 0,
    fitness: [],
    nutrition: [],
    snackWait: [],
  },
  pact: {
    current: null,
    history: [],
  },
  feed: {
    currentIndex: 0,
    savedTips: [],
  },
  ui: {
    moodSelected: null,
    moodTrend: '',
    archive: {
      bills: [],
      anchors: [],
      ideas: [],
      tasks: [],
    },
  },
};

export function cloneState(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export function createInitialState() {
  return cloneState(defaultState);
}

export function mergeStateWithDefaults(rawState) {
  const base = createInitialState();
  if (!rawState || typeof rawState !== 'object') {
    return base;
  }

  return {
    ...base,
    ...rawState,
    meta: {
      ...base.meta,
      ...(rawState.meta || {}),
    },
    settings: {
      ...base.settings,
      ...(rawState.settings || {}),
    },
    money: {
      ...base.money,
      ...(rawState.money || {}),
    },
    habits: {
      ...base.habits,
      ...(rawState.habits || {}),
    },
    pact: {
      ...base.pact,
      ...(rawState.pact || {}),
    },
    feed: {
      ...base.feed,
      ...(rawState.feed || {}),
    },
    ui: {
      ...base.ui,
      ...(rawState.ui || {}),
      archive: {
        ...base.ui.archive,
        ...((rawState.ui && rawState.ui.archive) || {}),
      },
    },
  };
}
