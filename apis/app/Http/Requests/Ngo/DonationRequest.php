<?php

namespace App\Http\Requests\Ngo;

use Illuminate\Foundation\Http\FormRequest;

/**
 * DonationRequest — validates donation pledge form submissions.
 * PAN validation enforced when 80G receipt is requested.
 */
class DonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Honeypot anti-bot check
        return empty($this->input('website'));
    }

    public function rules(): array
    {
        return [
            'reference'       => ['required', 'string', 'regex:/^DN-\d{8}-[A-Z0-9]{6}$/', 'max:30'],
            'amount'          => ['required', 'integer', 'min:100', 'max:1000000'],
            'designation'     => ['required', 'string', 'in:general,education,health,livelihoods,environment'],
            'name'            => ['required', 'string', 'min:2', 'max:100'],
            'email'           => ['required', 'email:rfc,dns', 'max:150'],
            'phone'           => ['required', 'string', 'regex:/^\+?[0-9\s]{10,15}$/', 'max:20'],
            'wants_80g'       => ['nullable', 'boolean'],
            'pan'             => ['required_if:wants_80g,true', 'nullable', 'string', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]$/'],
            'address'         => ['required_if:wants_80g,true', 'nullable', 'string', 'max:500'],
            'isIndianCitizen' => ['required', 'accepted'],
            'consentUpdates'  => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.min'           => 'Minimum donation is ₹100.',
            'amount.max'           => 'Maximum online donation is ₹10,00,000.',
            'pan.regex'            => 'Please enter a valid 10-character PAN (e.g. ABCDE1234F).',
            'isIndianCitizen.accepted' => 'Please confirm you are an Indian citizen.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name'    => strip_tags($this->name ?? ''),
            'address' => strip_tags($this->address ?? ''),
            'pan'     => strtoupper(trim($this->pan ?? '')),
        ]);
    }
}
