import { Injectable, signal, computed, inject } from '@angular/core';
import { IcaoDataService } from './icao-data.service';
import { TranslationService } from './translation.service';

export interface NotamDetails {
  designator?: string;
  navaidId?: string;
  airspaceName?: string;
  airspaceCoords?: string;
  obstacleType?: string;
  obstacleCoords?: string;
  obstacleHeight?: string;
  lighting?: boolean;
}

export interface NotamSchedule {
  frequency: string;
  startTime: string; // HHmm
  endTime: string;   // HHmm
}

export interface NotamData {
  messageType: 'NOTAMN' | 'NOTAMR' | 'NOTAMC';
  referenceNotam: string;
  category: string;
  subject: string;
  condition: string;
  itemA_location: string;
  itemB_start: string;
  itemC_end: string;
  itemD_schedule: NotamSchedule;
  itemE_text: string;
  itemF_lower: string;
  itemG_upper: string;
  details: NotamDetails;
}

const INITIAL_NOTAM_STATE: NotamData = {
  messageType: 'NOTAMN',
  referenceNotam: '',
  category: '',
  subject: '',
  condition: '',
  itemA_location: '',
  itemB_start: '',
  itemC_end: '',
  itemD_schedule: { frequency: '', startTime: '', endTime: '' },
  itemE_text: '',
  itemF_lower: '000',
  itemG_upper: '999',
  details: {},
};

@Injectable({
  providedIn: 'root'
})
export class NotamService {
  private icaoDataService = inject(IcaoDataService);
  private translationService = inject(TranslationService);

  // --- STATE ---
  notamForm = signal<NotamData>(JSON.parse(JSON.stringify(INITIAL_NOTAM_STATE)));

  // --- DERIVED STATE / BUSINESS LOGIC ---
  autoEText = computed(() => {
    const form = this.notamForm();
    if (form.itemE_text) {
        return form.itemE_text;
    }

    let text = '';
    switch (form.subject) {
        case 'RWY':
            text = `RWY ${form.details.designator || '[DESIGNATOR]'} ${form.condition}`;
            break;
        case 'TWY':
            text = `TWY ${form.details.designator || '[DESIGNATOR]'} ${form.condition}`;
            break;
        case 'APRON':
            text = `APRON ${form.details.designator || '[DESIGNATOR]'} ${form.condition}`;
            break;
        case 'NAVAID':
            text = `${form.details.navaidId || '[NAVAID ID]'} ${form.condition}`;
            break;
        case 'AIRSPACE':
            text = `${form.details.airspaceName || '[AIRSPACE NAME]'} ${form.condition} ${form.details.airspaceCoords || ''}`;
            break;
        case 'OBSTACLE':
            text = `OBST ${form.details.obstacleType || '[TYPE]'} AT ${form.details.obstacleCoords || '[COORDS]'}, ${form.details.obstacleHeight || '[HEIGHT]'}. ${form.details.lighting ? 'LGTD' : 'NOT LGTD'}`;
            break;
        default:
            text = `${form.subject} ${form.condition}`;
    }
    return text.trim();
  });

  finalNotam = computed(() => {
    const form = this.notamForm();
    const qLine = `Q) ${form.itemA_location}XX/QXXXX/I/NBO/A/000/999/XXX`;
    const aLine = `A) ${form.itemA_location}`;
    const bLine = `B) ${form.itemB_start}`;
    const cLine = `C) ${form.itemC_end}`;
    const dLine = form.itemD_schedule.frequency && form.itemD_schedule.startTime && form.itemD_schedule.endTime
      ? `D) ${form.itemD_schedule.frequency} ${form.itemD_schedule.startTime}-${form.itemD_schedule.endTime}`
      : null;
    const eLine = `E) ${this.autoEText()}`;
    const fLine = `F) ${form.itemF_lower}`;
    const gLine = `G) ${form.itemG_upper}`;

    return [qLine, aLine, bLine, cLine, dLine, eLine, fLine, gLine]
        .filter(line => line !== null)
        .join('\n');
  });

  // --- ACTIONS ---
  updateField(field: keyof Omit<NotamData, 'itemD_schedule' | 'details'>, value: any) {
    this.notamForm.update(form => ({ ...form, [field]: value }));
  }

  updateDetailField(field: keyof NotamDetails, value: any) {
    this.notamForm.update(form => ({
      ...form,
      details: { ...form.details, [field]: value }
    }));
  }

  updateScheduleField(field: keyof NotamSchedule, value: string) {
    if (field === 'startTime' || field === 'endTime') {
        value = value.replace(':', '');
    }
    this.notamForm.update(form => ({
      ...form,
      itemD_schedule: { ...form.itemD_schedule, [field]: value }
    }));
  }

  resetForm() {
    this.notamForm.set(JSON.parse(JSON.stringify(INITIAL_NOTAM_STATE)));
  }

  loadTemplate(key: string) {
    const template = this.icaoDataService.getTemplate(key);
    if (template) {
      this.resetForm();
      this.notamForm.update(form => ({
        ...form,
        category: template.data.category || '',
        subject: template.data.subject || '',
        condition: template.data.condition || '',
        itemE_text: template.data.itemE_text || ''
      }));
    }
  }
}
