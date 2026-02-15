import * as Sentry from '@sentry/vue'
import type { App } from 'vue'
import type { Router } from 'vue-router'

// --- Configuration ---
const MAX_MESSAGES_PER_SESSION = 50
let messageCount = 0

interface TelemetryData {
	[key: string]: string | number | boolean
}

interface MetricTags {
	[key: string]: string | number | boolean
}

export const trackMetric = (name: string, value: number = 1, attributes: MetricTags = {}): void => {
	Sentry.metrics.count(name, value, {
		attributes,
	})

	if (import.meta.env.MODE !== 'production') {
		console.log(`[Metric] ${name} = ${value}`, attributes)
	}
}

export const initTelemetry = (app: App<Element>, router: Router): void => {
	Sentry.init({
		app,
		dsn: import.meta.env.VITE_SENTRY_DSN,
		integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
		tracesSampleRate: 0.1,
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: 1,
	})
}

export const trackEvent = (
	name: string,
	data: TelemetryData = {},
	forceMessage: boolean = false,
): void => {
	Sentry.addBreadcrumb({
		category: 'ui.click',
		message: name,
		level: 'info',
		data,
	})

	// B. Logic to limit costly "Messages"
	if (forceMessage && messageCount < MAX_MESSAGES_PER_SESSION) {

            Sentry.captureMessage(`User Action: ${name}`, {
				level: 'info',
				extra: data,
				tags: {
					action_name: name,
					...data,
				} as unknown as { [key: string]: string },
			})
            
		// if (import.meta.env.MODE !== 'production') {
		// 	Sentry.captureMessage(`User Action: ${name}`, {
		// 		level: 'info',
		// 		extra: data,
		// 		tags: {
		// 			action_name: name,
		// 			...data,
		// 		} as unknown as { [key: string]: string },
		// 	})
		// }

		messageCount++

		if (messageCount === MAX_MESSAGES_PER_SESSION) {
			trackMetric('max_messages_per_session_reached', 1)
		}
	}

}
