<script lang="ts">
	import { Select, Label, Helper } from 'flowbite-svelte';

	interface Props {
		id?: string;
		name?: string;
		value: string;
		label?: string;
		required?: boolean;
		disabled?: boolean;
		color?: 'base' | 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'teal' | 'none';
		placeholder?: string;
		helperText?: string;
		errorMessage?: string;
		showLabel?: boolean;
	}

	let {
		id = 'state',
		name = 'state',
		value = $bindable(),
		label = 'State',
		required = false,
		disabled = false,
		color = undefined,
		placeholder = 'Select a state',
		helperText = 'Select the state where the park is located.',
		errorMessage = undefined,
		showLabel = true
	}: Props = $props();

	// US States for dropdown selection - name and abbreviation mapping
	const US_STATES = [
		{ name: 'Alabama', abbr: 'AL' },
		{ name: 'Alaska', abbr: 'AK' },
		{ name: 'American Samoa', abbr: 'AS' },
		{ name: 'Arizona', abbr: 'AZ' },
		{ name: 'Arkansas', abbr: 'AR' },
		{ name: 'California', abbr: 'CA' },
		{ name: 'Colorado', abbr: 'CO' },
		{ name: 'Connecticut', abbr: 'CT' },
		{ name: 'Delaware', abbr: 'DE' },
		{ name: 'District of Columbia', abbr: 'DC' },
		{ name: 'Federated States of Micronesia', abbr: 'FM' },
		{ name: 'Florida', abbr: 'FL' },
		{ name: 'Georgia', abbr: 'GA' },
		{ name: 'Guam', abbr: 'GU' },
		{ name: 'Hawaii', abbr: 'HI' },
		{ name: 'Idaho', abbr: 'ID' },
		{ name: 'Illinois', abbr: 'IL' },
		{ name: 'Indiana', abbr: 'IN' },
		{ name: 'Iowa', abbr: 'IA' },
		{ name: 'Kansas', abbr: 'KS' },
		{ name: 'Kentucky', abbr: 'KY' },
		{ name: 'Louisiana', abbr: 'LA' },
		{ name: 'Maine', abbr: 'ME' },
		{ name: 'Marshall Islands', abbr: 'MH' },
		{ name: 'Maryland', abbr: 'MD' },
		{ name: 'Massachusetts', abbr: 'MA' },
		{ name: 'Michigan', abbr: 'MI' },
		{ name: 'Minnesota', abbr: 'MN' },
		{ name: 'Mississippi', abbr: 'MS' },
		{ name: 'Missouri', abbr: 'MO' },
		{ name: 'Montana', abbr: 'MT' },
		{ name: 'Nebraska', abbr: 'NE' },
		{ name: 'Nevada', abbr: 'NV' },
		{ name: 'New Hampshire', abbr: 'NH' },
		{ name: 'New Jersey', abbr: 'NJ' },
		{ name: 'New Mexico', abbr: 'NM' },
		{ name: 'New York', abbr: 'NY' },
		{ name: 'North Carolina', abbr: 'NC' },
		{ name: 'North Dakota', abbr: 'ND' },
		{ name: 'Northern Mariana Islands', abbr: 'MP' },
		{ name: 'Ohio', abbr: 'OH' },
		{ name: 'Oklahoma', abbr: 'OK' },
		{ name: 'Oregon', abbr: 'OR' },
		{ name: 'Palau', abbr: 'PW' },
		{ name: 'Pennsylvania', abbr: 'PA' },
		{ name: 'Puerto Rico', abbr: 'PR' },
		{ name: 'Rhode Island', abbr: 'RI' },
		{ name: 'South Carolina', abbr: 'SC' },
		{ name: 'South Dakota', abbr: 'SD' },
		{ name: 'Tennessee', abbr: 'TN' },
		{ name: 'Texas', abbr: 'TX' },
		{ name: 'Utah', abbr: 'UT' },
		{ name: 'Vermont', abbr: 'VT' },
		{ name: 'U.S. Virgin Islands', abbr: 'VI' },
		{ name: 'Virginia', abbr: 'VA' },
		{ name: 'Washington', abbr: 'WA' },
		{ name: 'West Virginia', abbr: 'WV' },
		{ name: 'Wisconsin', abbr: 'WI' },
		{ name: 'Wyoming', abbr: 'WY' }
	];
</script>

<div>
	{#if showLabel}
		<Label for={id} class="mb-2 block">
			{label}
			{#if required}<span class="text-red-500">*</span>{/if}
		</Label>
	{/if}
	<Select {id} {name} bind:value {color} {disabled} {required}>
		<option value="" disabled>{placeholder}</option>
		{#each US_STATES as state (state.abbr)}
			<option value={state.abbr}>{state.name}</option>
		{/each}
	</Select>
	{#if errorMessage}
		<Helper class="mt-2" color="red">
			<span class="font-medium">Error:</span>
			{errorMessage}
		</Helper>
	{:else if helperText}
		<Helper class="mt-2">{helperText}</Helper>
	{/if}
</div>
