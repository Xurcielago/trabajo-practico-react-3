export type Category = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';
export type ReportStatus = 'pendiente' | 'en curso' | 'resuelto';

export type ReportLocation = {
  latitude?: number;
  longitude?: number;
  sector?: string;
  approximate?: boolean;
};

export type Report = {
  id: string;
  title: string;
  description: string;
  classroom: string;
  category: Category;
  photoUri?: string;
  location?: ReportLocation;
  status: ReportStatus;
  createdAt: string;
};

export type ReportDraft = Omit<Report, 'id' | 'status' | 'createdAt'>;

export type Notice = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
};

export const EMPTY_DRAFT: ReportDraft = {
  title: '',
  description: '',
  classroom: '',
  category: 'electricidad',
};
