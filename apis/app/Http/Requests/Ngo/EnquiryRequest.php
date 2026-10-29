<?php

namespace App\Http\Requests\Ngo;

use Illuminate\Foundation\Http\FormRequest;

/**
 * EnquiryRequest — validates public contact form submissions.
 * All inputs sanitized. Honeypot field checked for bots.
 */
class EnquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Block bots via honeypot field
        return empty($this->input('website'));
    }

    public function rules(): array
    {
        return [
            'type'    => ['required', 'string', 'in:general,volunteer,partner,csr'],
            'name'    => ['required', 'string', 'min:2', 'max:100'],
            'email'   => ['required', 'email:rfc,dns', 'max:150'],
            'phone'   => ['nullable', 'string', 'max:20', 'regex:/^\+?[0-9\s\-]{7,20}$/'],
            'message' => ['required', 'string', 'min:5', 'max:3000'],
            'consent' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.in'         => 'Please choose a valid enquiry type.',
            'name.min'        => 'Please enter your full name.',
            'email.email'     => 'Please enter a valid email address.',
            'phone.regex'     => 'Please enter a valid phone number.',
            'message.min'     => 'Please tell us a little more.',
            'consent.accepted'=> 'Please agree so we can reply to you.',
        ];
    }

    /** Strip dangerous characters from all inputs */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name'    => strip_tags($this->name ?? ''),
            'message' => strip_tags($this->message ?? ''),
            'phone'   => preg_replace('/[^+0-9\s\-]/', '', $this->phone ?? ''),
        ]);
    }
}
