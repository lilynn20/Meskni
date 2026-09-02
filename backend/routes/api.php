<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SavedListingController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/listings', [ListingController::class, 'store']);
    Route::put('/listings/{listing}', [ListingController::class, 'update']);
    Route::patch('/listings/{listing}/archive', [ListingController::class, 'archive']);
    Route::post('/listings/{listing}/images', [ListingController::class, 'uploadImages']);
    Route::delete('/listings/{listing}/images/{imageId}', [ListingController::class, 'deleteImage']);
    Route::get('/saved-listings', [SavedListingController::class, 'index']);
    Route::post('/listings/{listing}/save', [SavedListingController::class, 'store']);
    Route::delete('/listings/{listing}/save', [SavedListingController::class, 'destroy']);
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/listings/{listing}/messages', [MessageController::class, 'store']);
    Route::post('/messages/{message}/reply', [MessageController::class, 'reply']);
});
