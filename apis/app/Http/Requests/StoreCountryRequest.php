<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'country_code'       => 'required|string|max:5|unique:countries,country_code',
            'name'               => 'required|string|max:100',
            'slug'               => 'nullable|string|max:120|unique:countries,slug',
            'currency'           => 'required|string|max:25',
            'flag_code'          => 'nullable|string|max:10',
            'tagline'            => 'nullable|string|max:255',
            'description'        => 'nullable|string',
            'avg_tuition'        => 'nullable|string|max:100',
            'cost_of_living'     => 'nullable|string|max:100',
            'post_study_work'    => 'nullable|string|max:150',
            'intakes'            => 'nullable|string|max:255',
            'universities_count' => 'nullable|integer|min:0',
            'is_active'          => 'nullable|boolean',
            'is_featured'        => 'nullable|boolean',
            'display_order'      => 'nullable|integer',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success'    => false,
            'statusCode' => 422,
            'message'    => 'Country validation failed.',
            'data'       => null,
            'errors'     => $validator->errors(),
        ], 422));
    }
}
