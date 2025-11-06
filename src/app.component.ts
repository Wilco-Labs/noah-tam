import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { IcaoDataService, NotamTemplate } from './services/icao-data.service';
// FIX: Import NotamData and NotamDetails for strong typing.
import { NotamService, NotamData, NotamDetails } from './services/notam.service';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // FIX: Added explicit types for injected services to resolve 'unknown' type errors.
  private notamService: NotamService = inject(NotamService);
  private icaoDataService: IcaoDataService = inject(IcaoDataService);
  private translationService: TranslationService = inject(TranslationService);
  
  // --- STATE FOR UI ONLY ---
  step = signal(1);
  isModalVisible = signal(false);
  airportSearchTerm = signal('');
  showAirportResults = signal(false);

  // --- EXPOSE SERVICES TO TEMPLATE ---
  notamForm = this.notamService.notamForm;
  finalNotam = this.notamService.finalNotam;
  autoEText = this.notamService.autoEText;
  t = this.translationService.t;
  language = this.translationService.language;
  availableLanguages = this.translationService.availableLanguages;
  
  // --- DATA FOR TEMPLATE ---
  readonly steps = [
    { id: 1, nameKey: 'step1' },
    { id: 2, nameKey: 'step2' },
    { id: 3, nameKey: 'step3' },
  ];
  readonly messageTypes = ['NOTAMN', 'NOTAMR', 'NOTAMC'];
  readonly categories = this.icaoDataService.getCategories();
  readonly templates = this.icaoDataService.getTemplates();
  readonly scheduleFrequencies = this.icaoDataService.getScheduleFrequencies();

  // --- COMPUTED SIGNALS FOR UI ---
  availableSubjects = computed(() => this.icaoDataService.getSubjectsForCategory(this.notamForm().category));
  availableConditions = computed(() => this.icaoDataService.getConditionsForSubject(this.notamForm().subject));
  filteredAirports = computed(() => this.icaoDataService.searchAirports(this.airportSearchTerm()));

  // --- UI METHODS ---
  nextStep() { this.step.update(s => Math.min(s + 1, 3)); }
  prevStep() { this.step.update(s => Math.max(s - 1, 1)); }
  goToStep(step: number) { this.step.set(step); }
  showModal() { this.isModalVisible.set(true); }
  closeModal() { this.isModalVisible.set(false); }

  setLanguage(lang: 'en' | 'fr' | 'pt' | 'sw') {
    this.translationService.setLanguage(lang);
  }

  resetForm() {
    this.notamService.resetForm();
    this.step.set(1);
  }
  
  loadTemplate(key: string) {
    if (!key) return;
    this.notamService.loadTemplate(key);
    this.step.set(1);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.finalNotam());
  }

  downloadFile(format: 'txt' | 'json') {
    const form = this.notamForm();
    const notamText = this.finalNotam();
    const data = format === 'txt' 
        ? notamText 
        : JSON.stringify({ raw: form, composed: notamText }, null, 2);

    const blob = new Blob([data], { type: format === 'txt' ? 'text/plain' : 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NOTAM_${form.itemA_location}_${form.itemB_start}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // --- FORM UPDATE METHODS (Event Handlers) ---
  // FIX: Replaced `any` with `NotamData` for type safety to fix assignment error.
  updateField(field: keyof Omit<NotamData, 'itemD_schedule' | 'details' | 'itemA_location'>, eventOrValue: Event | string) {
    const value = typeof eventOrValue === 'string' ? eventOrValue : (eventOrValue.target as HTMLInputElement).value;
    this.notamService.updateField(field, value);
  }

  // FIX: Used specific `keyof NotamDetails` type instead of `string` to fix assignment error.
  updateDetailField(field: keyof NotamDetails, eventOrValue: Event | boolean) {
    const value = typeof eventOrValue === 'boolean' ? eventOrValue : (eventOrValue.target as HTMLInputElement).value;
    this.notamService.updateDetailField(field, value);
  }

  updateScheduleField(field: 'frequency' | 'startTime' | 'endTime', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.notamService.updateScheduleField(field, value);
  }

  formatTimeToInput(time: string): string { // time is HHmm
    if (time && time.length === 4) {
      return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
    }
    return '';
  }

  // --- AIRPORT SEARCH METHODS ---
  onAirportInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.notamService.updateField('itemA_location', value);
    this.airportSearchTerm.set(value);
    this.showAirportResults.set(true);
  }

  selectAirport(icao: string) {
    this.notamService.updateField('itemA_location', icao);
    this.airportSearchTerm.set(icao);
    this.showAirportResults.set(false);
  }

  onAirportBlur() {
    setTimeout(() => this.showAirportResults.set(false), 200);
  }
}
