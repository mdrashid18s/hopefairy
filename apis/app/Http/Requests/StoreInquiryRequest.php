<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'             => 'nullable|string|max:50',
            'name'             => 'required|string|min:2|max:100',
            'email'            => 'required|email|max:150',
            'phone'            => 'required|string|min:7|max:25',
            'city'             => 'nullable|string|max:100',
            'interest'         => 'nullable|string|max:150',
            'qualification'    => 'nullable|string|max:150',
            'studyLevel'       => 'nullable|string|max:150',
            'study_level'      => 'nullable|string|max:150',
            'destination'      => 'nullable|string|max:100',
            'destination_id'   => 'nullable',
            'destination_name' => 'nullable|string|max:100',
            'intake'           => 'nullable|string|max:100',
            'course'           => 'nullable|string|max:150',
            'message'          => 'nullable|string|max:3000',
            'source'           => 'nullable|string|max:150',
            'website'          => 'nullable|string|max:150',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Please enter your full name.',
            'name.min'       => 'Name must be at least 2 characters.',
            'email.required' => 'Enter a valid email address.',
            'email.email'    => 'Enter a valid email address.',
            'phone.required' => 'Enter a valid phone number so we can reach you.',
            'phone.min'      => 'Enter a valid phone number so we can reach you.',
        ];
    }

    /**
     * Enforce standard API error envelope on validation failures
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success'    => false,
            'statusCode' => 422,
            'message'    => 'Please check the form and try again.',
            'data'       => null,
            'errors'     => $validator->errors(),
        ], 422));
    }
}
