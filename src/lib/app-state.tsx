import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { EMPTY_DRAFT, Notice, Report, ReportDraft, ReportStatus } from './types';

type AppStateValue = {
  reports: Report[];
  notices: Notice[];
  draft: ReportDraft;
  notificationsEnabled: boolean;
  updateDraft: (changes: Partial<ReportDraft>) => void;
  createReport: () => Report;
  updateReportStatus: (id: string, status: ReportStatus) => void;
  addNotice: (title: string, message: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [reports, setReports] = useState<Report[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [draft, setDraft] = useState<ReportDraft>(EMPTY_DRAFT);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const value = useMemo<AppStateValue>(
    () => ({
      reports,
      notices,
      draft,
      notificationsEnabled,
      updateDraft: (changes) => setDraft((current) => ({ ...current, ...changes })),
      createReport: () => {
        const report: Report = {
          ...draft,
          id: Date.now().toString(),
          status: 'pendiente',
          createdAt: new Date().toISOString(),
        };
        setReports((current) => [report, ...current]);
        setDraft(EMPTY_DRAFT);
        return report;
      },
      updateReportStatus: (id, status) =>
        setReports((current) =>
          current.map((report) => (report.id === id ? { ...report, status } : report)),
        ),
      addNotice: (title, message) =>
        setNotices((current) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            title,
            message,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]),
      setNotificationsEnabled,
    }),
    [draft, notificationsEnabled, notices, reports],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error('useAppState debe usarse dentro de AppStateProvider.');
  }
  return state;
}
