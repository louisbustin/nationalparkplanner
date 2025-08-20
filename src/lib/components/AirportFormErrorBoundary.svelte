<script lang="ts">
	import { Alert, Button } from 'flowbite-svelte';
	import { ExclamationCircleOutline, ArrowsRepeatOutline } from 'flowbite-svelte-icons';

	interface Props {
		error?: string | null;
		fieldErrors?: Record<string, string> | null;
		onRetry?: () => void;
		children: import('svelte').Snippet;
	}

	let { error, fieldErrors, onRetry, children }: Props = $props();

	const hasErrors = $derived(!!error || (fieldErrors && Object.keys(fieldErrors).length > 0));
	const errorCount = $derived(fieldErrors ? Object.keys(fieldErrors).length : 0);

	function handleRetry() {
		if (onRetry) {
			onRetry();
		}
	}

	// Airport-specific error messages
	function getAirportSpecificMessage(field: string, message: string): string {
		const airportMessages: Record<string, string> = {
			iataCode: 'IATA codes must be exactly 3 uppercase letters (e.g., LAX, JFK, DEN)',
			icaoCode: 'ICAO codes must be exactly 4 uppercase letters (e.g., KLAX, KJFK)',
			latitude: 'Latitude must be between -90 and 90 degrees',
			longitude: 'Longitude must be between -180 and 180 degrees',
			elevation: 'Elevation must be a valid number in feet',
			timezone: 'Timezone must be a valid IANA timezone identifier (e.g., America/New_York)'
		};

		return airportMessages[field] || message;
	}
</script>

{#if hasErrors}
	<div class="mb-6 space-y-4">
		{#if error}
			<Alert color="red">
				{#snippet icon()}
					<ExclamationCircleOutline class="h-5 w-5" />
				{/snippet}
				<span class="font-medium">Airport Creation/Update Failed</span>
				<div class="mt-2 text-sm">
					{error}
				</div>
				{#if onRetry}
					<div class="mt-3">
						<Button size="xs" color="red" onclick={handleRetry}>
							<ArrowsRepeatOutline class="mr-2 h-3 w-3" />
							Try Again
						</Button>
					</div>
				{/if}
			</Alert>
		{/if}

		{#if fieldErrors && errorCount > 0}
			<Alert color="red">
				{#snippet icon()}
					<ExclamationCircleOutline class="h-5 w-5" />
				{/snippet}
				<span class="font-medium">
					{errorCount === 1 ? '1 field has an error' : `${errorCount} fields have errors`}
				</span>
				<div class="mt-2 text-sm">
					<p class="mb-2">Please correct the following airport information:</p>
					<ul class="list-inside list-disc space-y-1">
						{#each Object.entries(fieldErrors) as [field, message] (field)}
							<li>
								<span class="font-medium capitalize"
									>{field.replace(/([A-Z])/g, ' $1').trim()}:</span
								>
								{getAirportSpecificMessage(field, message)}
							</li>
						{/each}
					</ul>
				</div>
			</Alert>
		{/if}
	</div>
{/if}

{@render children()}
