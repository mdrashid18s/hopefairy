<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\OfferingController;
use App\Http\Controllers\IndiaAdmissionsController;
use App\Http\Controllers\TestPrepController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\SiteController;

/*
|--------------------------------------------------------------------------
| HopeFairy RESTful API Routes
|--------------------------------------------------------------------------
*/

// Site configuration & FAQs
Route::get('/site', [SiteController::class, 'site']);
Route::get('/faqs', [SiteController::class, 'faqs']);

// Destinations Module (Study Abroad Countries)
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{slug}', [DestinationController::class, 'show']);

// Services Module (Study Abroad Offerings)
Route::get('/services', [OfferingController::class, 'index']);
Route::get('/services/{slug}', [OfferingController::class, 'show']);

// India Admissions Module (Streams, Programs, Entrance Exams)
Route::get('/india-admissions', [IndiaAdmissionsController::class, 'index']);

// Test Preparation Module (IMAT, GMAT, IELTS, CELPIP)
Route::get('/test-prep', [TestPrepController::class, 'index']);
Route::get('/test-prep/{slug}', [TestPrepController::class, 'show']);

// Leads & Inquiries Form (Throttled: 10 attempts per minute per IP against automated spam & DoS)
Route::post('/contact', [InquiryController::class, 'store'])->middleware('throttle:10,1');
Route::post('/inquiries', [InquiryController::class, 'store'])->middleware('throttle:10,1');

// Public Testimonials (Returns active reviews when available)
use App\Http\Controllers\Admin\AdminTestimonialController;
Route::get('/testimonials', [AdminTestimonialController::class, 'publicIndex']);

// Psychometric & Hope Fairy Compass Module
use App\Http\Controllers\PsychometricController;
Route::get('/psychometric', [PsychometricController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Admin Portal API Routes (Token Authentication & Modules)
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\Admin\AdminDestinationController;
use App\Http\Controllers\Admin\AdminInquiryController;
use App\Http\Controllers\Admin\AdminOfferingController;
use App\Http\Controllers\Admin\AdminSiteController;
use App\Http\Controllers\Admin\AdminCountryCourseController;
use App\Http\Controllers\Admin\AdminCourseController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminMetadataController;
use App\Http\Controllers\Admin\AdminResourceController;

Route::prefix('admin')->group(function () {
    // Public Authentication & OTP Endpoints (Hardened with Rate Limiting against Brute Force & Spam)
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/register', [AdminAuthController::class, 'register'])->middleware('throttle:5,1');
    Route::match(['get', 'post'], '/approve-registration', [AdminAuthController::class, 'approveRegistration']);
    Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('/verify-otp', [AdminAuthController::class, 'verifyOtp'])->middleware('throttle:5,1');
    Route::post('/reset-password', [AdminAuthController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::match(['get', 'post'], '/verify-reset-token', [AdminAuthController::class, 'verifyResetToken'])->middleware('throttle:15,1');
    Route::post('/reset-password-with-token', [AdminAuthController::class, 'resetPasswordWithToken'])->middleware('throttle:10,1');

    // Protected Admin Endpoints (Laravel Sanctum Token)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/stats', [AdminInquiryController::class, 'stats']);

        // Countries Management (Add / Update / Delete / Toggle Country where services are provided)
        Route::get('/countries', [AdminDestinationController::class, 'index']);
        Route::post('/countries', [AdminDestinationController::class, 'store']);
        Route::put('/countries/{id}', [AdminDestinationController::class, 'update']);
        Route::patch('/countries/{id}/toggle', [AdminDestinationController::class, 'toggle']);
        Route::delete('/countries/{id}', [AdminDestinationController::class, 'destroy']);

        Route::get('/destinations', [AdminDestinationController::class, 'index']);
        Route::post('/destinations', [AdminDestinationController::class, 'store']);
        Route::put('/destinations/{id}', [AdminDestinationController::class, 'update']);
        Route::patch('/destinations/{id}/toggle', [AdminDestinationController::class, 'toggle']);
        Route::delete('/destinations/{id}', [AdminDestinationController::class, 'destroy']);

        // Country Courses Management (Relational table linking to countries)
        Route::get('/country-courses', [AdminCountryCourseController::class, 'index']);
        Route::get('/countries/{countryId}/courses', [AdminCountryCourseController::class, 'index']);
        Route::post('/country-courses', [AdminCountryCourseController::class, 'store']);
        Route::put('/country-courses/{course}', [AdminCountryCourseController::class, 'update']);
        Route::patch('/country-courses/{course}/toggle', [AdminCountryCourseController::class, 'toggle']);
        Route::delete('/country-courses/{course}', [AdminCountryCourseController::class, 'destroy']);

        // Leads & Inquiries Management
        Route::get('/inquiries', [AdminInquiryController::class, 'index']);
        Route::patch('/inquiries/{inquiry}/status', [AdminInquiryController::class, 'updateStatus']);
        Route::patch('/inquiries/{inquiry}/toggle', [AdminInquiryController::class, 'toggle']);
        Route::delete('/inquiries/{inquiry}', [AdminInquiryController::class, 'destroy']);

        // Services Management
        Route::get('/services', [AdminOfferingController::class, 'index']);
        Route::post('/services', [AdminOfferingController::class, 'store']);
        Route::post('/services/upload-image', [AdminOfferingController::class, 'uploadImage']);
        Route::match(['put', 'patch', 'post'], '/services/{service}', [AdminOfferingController::class, 'update']);
        Route::patch('/services/{service}/toggle', [AdminOfferingController::class, 'toggle']);
        Route::delete('/services/{service}', [AdminOfferingController::class, 'destroy']);

        // Users & Account Management (is_active toggle, role toggle, encrypted password reveal, change password, reset link)
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::patch('/users/{id}/toggle', [AdminUserController::class, 'toggle']);
        Route::patch('/users/{id}/role', [AdminUserController::class, 'toggleRole']);
        Route::put('/users/{id}/password', [AdminUserController::class, 'updatePassword']);
        Route::post('/users/{id}/reset-link', [AdminUserController::class, 'generateResetLink']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
        Route::get('/users/{id}/decrypt-password', [AdminUserController::class, 'decryptPassword']);

        // India Admissions Courses & Categories Management (courses table)
        Route::get('/courses', [AdminCourseController::class, 'index']);
        Route::post('/courses', [AdminCourseController::class, 'store']);
        Route::put('/courses/{id}', [AdminCourseController::class, 'update']);
        Route::patch('/courses/{id}/toggle', [AdminCourseController::class, 'toggle']);
        Route::delete('/courses/{id}', [AdminCourseController::class, 'destroy']);

        // India Admissions Streams / Categories
        Route::get('/india-admissions/streams', [AdminCourseController::class, 'getStreams']);
        Route::post('/india-admissions/streams', [AdminCourseController::class, 'storeStream']);
        Route::put('/india-admissions/streams/{id}', [AdminCourseController::class, 'updateStream']);
        Route::patch('/india-admissions/streams/{id}/toggle', [AdminCourseController::class, 'toggleStream']);
        Route::delete('/india-admissions/streams/{id}', [AdminCourseController::class, 'destroyStream']);

        // Site Settings & FAQs Management
        Route::get('/settings', [AdminSiteController::class, 'getSettings']);
        Route::put('/settings', [AdminSiteController::class, 'updateSettings']);
        Route::get('/faqs', [AdminSiteController::class, 'getFaqs']);
        Route::post('/faqs', [AdminSiteController::class, 'storeFaq']);
        Route::put('/faqs/{faq}', [AdminSiteController::class, 'updateFaq']);
        Route::delete('/faqs/{faq}', [AdminSiteController::class, 'destroyFaq']);

        // Testimonials Management
        Route::get('/testimonials', [AdminTestimonialController::class, 'index']);
        Route::post('/testimonials', [AdminTestimonialController::class, 'store']);
        Route::post('/testimonials/upload-avatar', [AdminTestimonialController::class, 'uploadAvatar']);
        Route::put('/testimonials/{id}', [AdminTestimonialController::class, 'update']);
        Route::patch('/testimonials/{id}/toggle', [AdminTestimonialController::class, 'toggle']);
        Route::delete('/testimonials/{id}', [AdminTestimonialController::class, 'destroy']);

        // Academic Metadata Management (Course -> Subject -> Topic -> Subtopic)
        Route::get('/metadata', [AdminMetadataController::class, 'index']);
        Route::get('/metadata/hierarchy', [AdminMetadataController::class, 'hierarchy']);
        Route::post('/metadata', [AdminMetadataController::class, 'store']);
        Route::match(['put', 'patch', 'post'], '/metadata/{id}', [AdminMetadataController::class, 'update']);
        Route::patch('/metadata/{id}/toggle', [AdminMetadataController::class, 'toggle']);
        Route::delete('/metadata/{id}', [AdminMetadataController::class, 'destroy']);

        // Dedicated 3NF Normalized Masters for Subjects, Topics, Subtopics
        Route::get('/subjects', [AdminMetadataController::class, 'getSubjects']);
        Route::post('/subjects', [AdminMetadataController::class, 'storeSubject']);
        Route::put('/subjects/{id}', [AdminMetadataController::class, 'updateSubject']);
        Route::delete('/subjects/{id}', [AdminMetadataController::class, 'destroySubject']);

        Route::get('/topics', [AdminMetadataController::class, 'getTopics']);
        Route::post('/topics', [AdminMetadataController::class, 'storeTopic']);
        Route::put('/topics/{id}', [AdminMetadataController::class, 'updateTopic']);
        Route::delete('/topics/{id}', [AdminMetadataController::class, 'destroyTopic']);

        Route::get('/subtopics', [AdminMetadataController::class, 'getSubtopics']);
        Route::post('/subtopics', [AdminMetadataController::class, 'storeSubtopic']);
        Route::put('/subtopics/{id}', [AdminMetadataController::class, 'updateSubtopic']);
        Route::delete('/subtopics/{id}', [AdminMetadataController::class, 'destroySubtopic']);

        // Resources & Study Materials Management (Linked to Metadata, Pricing, PDF & Discounts)
        Route::get('/resources', [AdminResourceController::class, 'index']);
        Route::get('/resources/stats', [AdminResourceController::class, 'stats']);
        Route::post('/resources', [AdminResourceController::class, 'store']);
        Route::post('/resources/upload-pdf', [AdminResourceController::class, 'uploadPdf']);
        Route::post('/resources/upload-thumbnail', [AdminResourceController::class, 'uploadThumbnail']);
        Route::match(['put', 'patch', 'post'], '/resources/{id}', [AdminResourceController::class, 'update']);
        Route::patch('/resources/{id}/toggle', [AdminResourceController::class, 'toggle']);
        Route::patch('/resources/{id}/featured', [AdminResourceController::class, 'toggleFeatured']);
        Route::delete('/resources/{id}', [AdminResourceController::class, 'destroy']);
    });
});

