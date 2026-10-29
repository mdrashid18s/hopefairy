<?php

namespace App\Services;

class PsychometricService
{
    /**
     * Get complete psychometric section data including HopeFairy Compass.
     */
    public function getSectionData(): array
    {
        return [
            'eyebrow'        => 'HopeFairy Compass',
            'title'          => 'Your Potential.',
            'headlineAccent' => 'Design Your Future.',
            'intro'          => 'Every student is unique, with inherent strengths, untapped potential and individual aspirations. Our comprehensive career counselling programme combines scientifically designed psychometric assessments with personalised one-to-one counselling to help students of Classes IX–XII identify their aptitude, interests, personality traits and natural inclinations. We empower students to make informed subject choices, explore suitable academic pathways and discover career opportunities aligned with their true potential. Because the right guidance at the right time can transform a student’s potential into a lifetime of achievement.',
            'ctaPrimary'     => 'Book One to One Consultation',
            'ctaSecondary'   => 'Talk to an Advisor',
            'trustBadges'    => $this->getTrustBadges(),
            'pillars'        => $this->getPillars(),
            'stages'         => $this->getStages(),
        ];
    }

    /**
     * Get the 4 core psychometric evaluation pillars.
     */
    public function getPillars(): array
    {
        return [
            [
                'num'   => '01',
                'title' => 'Personality & Behavioral Traits',
                'short' => 'Uncover working styles, interpersonal dynamics, emotional intelligence, and natural inclinations based on validated psychometric models.',
                'icon'  => 'brain',
            ],
            [
                'num'   => '02',
                'title' => 'Aptitude & Cognitive Strengths',
                'short' => 'Evaluate critical reasoning, logical deduction, numerical agility, spatial perception, and problem-solving velocity.',
                'icon'  => 'lightbulb',
            ],
            [
                'num'   => '03',
                'title' => 'Career & Industry Alignment',
                'short' => 'Scientifically match your unique profile against 150+ emerging career disciplines across STEM, Business, Law, Healthcare, and Design.',
                'icon'  => 'compass',
            ],
            [
                'num'   => '04',
                'title' => '1-on-1 Counsellor Roadmap',
                'short' => 'A deep-dive debrief with a senior HopeFairy education counsellor to translate your score into an actionable college shortlist.',
                'icon'  => 'graduation-cap',
            ],
        ];
    }

    /**
     * Get target stages for psychometric assessment.
     */
    public function getStages(): array
    {
        return [
            [
                'grade' => 'Class 9 – 10',
                'badge' => 'Stream Selection',
                'desc'  => 'Clarity on Science (PCM/PCB), Commerce, or Humanities based on true cognitive abilities.',
            ],
            [
                'grade' => 'Class 11 – 12',
                'badge' => 'Degree & College Target',
                'desc'  => 'Pinpoint target bachelor degrees and ideal entrance pathways (JEE, NEET, CLAT, SAT, IMAT, CUET).',
            ],
            [
                'grade' => 'College & Graduates',
                'badge' => 'Career Realignment',
                'desc'  => 'Master’s degree roadmap, MBA vs MS decision, and transition into high-growth global professions.',
            ],
        ];
    }

    /**
     * Get trust badges.
     */
    public function getTrustBadges(): array
    {
        return [
            ['label' => '1:1 Career Strategy Session', 'icon' => 'heart-handshake'],
            ['label' => 'Globally Validated Framework', 'icon' => 'shield-check'],
            ['label' => '25+ Page Diagnostic Report', 'icon' => 'file-text'],
        ];
    }
}
