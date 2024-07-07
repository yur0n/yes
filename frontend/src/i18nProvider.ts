import polyglotI18nProvider from 'ra-i18n-polyglot';
import en from './i18n/en';
import ru from './i18n/ru';

const translations = { en, ru };

export const i18nProvider = polyglotI18nProvider(
	locale => translations[locale as keyof typeof translations],
	'ru',
	[
			{ locale: 'en', name: 'English' },
			{ locale: 'ru', name: 'Русский' }
	],
);