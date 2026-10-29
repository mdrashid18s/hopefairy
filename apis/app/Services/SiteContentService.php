<?php

namespace App\Services;

use App\Models\Faq;
use App\Models\SiteSetting;
use Illuminate\Database\Eloquent\Collection;

class SiteContentService
{
    /**
     * Get site configuration, branding, and contact details from site_settings.
     */
    public function getSiteData(): array
    {
        return [
            'name'         => SiteSetting::getValue('name', 'HopeFairy'),
            'wordmark'     => [
                SiteSetting::getValue('wordmark_0', 'Hope'),
                SiteSetting::getValue('wordmark_1', 'Fairy')
            ],
            'tagline'      => SiteSetting::getValue('tagline', 'Where Dreams Meet Destinations'),
            'kicker'       => SiteSetting::getValue('kicker', 'Study Abroad · India Admissions · Test Prep'),
            'description'  => SiteSetting::getValue('description', 'HopeFairy is an Indian education consultancy for students aiming high.'),
            'phone'        => SiteSetting::getValue('phone', '+91 98116 09755'),
            'phoneHref'    => SiteSetting::getValue('phone_href', 'tel:+919811609755'),
            'whatsappHref' => SiteSetting::getValue('whatsapp_href', 'https://wa.me/919811609755'),
            'email'        => SiteSetting::getValue('email', 'info@hopefairy.com'),
            'emailHref'    => SiteSetting::getValue('email_href', 'mailto:info@hopefairy.com'),
            'location'     => SiteSetting::getValue('location', 'India'),
            'hours'        => SiteSetting::getValue('hours', 'Mon – Sat · 10:00 AM – 7:00 PM IST'),
            'socials'      => [
                ['label' => 'Instagram', 'href' => SiteSetting::getValue('social_instagram', 'https://instagram.com'), 'icon' => 'instagram'],
                ['label' => 'Facebook', 'href' => SiteSetting::getValue('social_facebook', 'https://facebook.com'), 'icon' => 'facebook'],
                ['label' => 'LinkedIn', 'href' => SiteSetting::getValue('social_linkedin', 'https://linkedin.com'), 'icon' => 'linkedin'],
                ['label' => 'YouTube', 'href' => SiteSetting::getValue('social_youtube', 'https://youtube.com'), 'icon' => 'youtube'],
            ],
        ];
    }

    /**
     * Get all active FAQs for public site.
     */
    public function getFaqs(bool $activeOnly = true): Collection
    {
        $query = Faq::orderBy('display_order', 'asc');
        if ($activeOnly) {
            $query->where('is_active', true);
        }
        return $query->get();
    }

    /**
     * Get all FAQs for admin management.
     */
    public function getAllFaqs(): Collection
    {
        return $this->getFaqs(false);
    }

    /**
     * Create new FAQ.
     */
    public function createFaq(array $data): Faq
    {
        $data['is_active'] = $data['is_active'] ?? true;
        $data['display_order'] = $data['display_order'] ?? (Faq::max('display_order') + 1);

        return Faq::create($data);
    }

    /**
     * Update FAQ.
     */
    public function updateFaq(Faq $faq, array $data): Faq
    {
        $faq->update($data);
        return $faq->fresh();
    }

    /**
     * Delete FAQ.
     */
    public function deleteFaq(Faq $faq): bool
    {
        return (bool) $faq->delete();
    }

    /**
     * Get all site settings as a key-value dictionary.
     */
    public function getSettings(): array
    {
        return SiteSetting::all()->pluck('setting_value', 'setting_key')->toArray();
    }

    /**
     * Bulk update site settings.
     */
    public function updateSettings(array $settings): array
    {
        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(
                ['setting_key' => $key],
                [
                    'setting_value' => is_string($value) ? $value : json_encode($value),
                    'group_name'    => 'general',
                ]
            );
        }

        return $this->getSettings();
    }
}
