<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $country = $this->route('country');
        $countryId = is_object($country) ? $country->id : $country;

        return [
            'country_code'       => ['sometimes', 'required', 'string', 'max:5', Rule::unique('countries')->ignore($countryId)],
            'name'               => ['sometimes', 'required', 'string', 'max:100'],
            'slug'               => ['sometimes', 'required', 'string', 'max:120', Rule::unique('countries')->ignore($countryId)],
            'currency'           => ['sometimes', 'required', 'string', 'max:25'],
            'flag_code'          => ['nullable', 'string', 'max:10'],
            'tagline'            => ['nullable', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'avg_tuition'        => ['nullable', 'string', 'max:100'],
            'cost_of_living'     => ['nullable', 'string', 'max:100'],
            'post_study_work'    => ['nullable', 'string', 'max:150'],
            'intakes'            => ['nullable', 'string', 'max:255'],
            'universities_count' => ['nullable', 'integer', 'min:0'],
            'is_active'          => ['nullable', 'boolean'],
            'is_featured'        => ['nullable', 'boolean'],
            'display_order'      => ['nullable', 'integer'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success'    => false,
            'statusCode' => 422,
            'message'    => 'Country update validation failed.',
            'data'       => null,
            'errors'     => $validator->errors(),
        ], 422));
    }
}
