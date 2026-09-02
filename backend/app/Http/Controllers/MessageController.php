<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = Message::query()
            ->where(fn ($query) => $query
                ->where('sender_id', $request->user()->id)
                ->orWhere('receiver_id', $request->user()->id))
            ->with(['listing:id,title,city,neighborhood', 'sender:id,name', 'receiver:id,name'])
            ->orderBy('created_at')
            ->get()
            ->groupBy('thread_id')
            ->map(fn ($threadMessages) => $this->conversation($threadMessages, $request->user()->id))
            ->values();

        return response()->json(['data' => $messages]);
    }

    public function store(Request $request, Listing $listing): JsonResponse
    {
        abort_unless($request->user()->role === 'seeker', 403, 'Only seekers can start an inquiry.');
        abort_if($request->user()->id === $listing->owner_id, 422, 'You cannot message yourself.');

        $validated = $request->validate(['body' => ['required', 'string', 'min:2', 'max:5000']]);
        $message = Message::create([
            'thread_id' => (string) Str::uuid(),
            'listing_id' => $listing->id,
            'sender_id' => $request->user()->id,
            'receiver_id' => $listing->owner_id,
            'body' => trim($validated['body']),
        ]);

        return response()->json(['data' => $this->message($message->load(['listing:id,title,city,neighborhood', 'sender:id,name', 'receiver:id,name']))], 201);
    }

    public function reply(Request $request, Message $message): JsonResponse
    {
        abort_unless(in_array($request->user()->id, [$message->sender_id, $message->receiver_id], true), 403);
        abort_if($request->user()->id === $message->sender_id && $request->user()->role !== 'owner', 403);

        $validated = $request->validate(['body' => ['required', 'string', 'min:2', 'max:5000']]);
        $reply = Message::create([
            'thread_id' => $message->thread_id,
            'listing_id' => $message->listing_id,
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->user()->id === $message->sender_id ? $message->receiver_id : $message->sender_id,
            'body' => trim($validated['body']),
        ]);

        return response()->json(['data' => $this->message($reply->load(['listing:id,title,city,neighborhood', 'sender:id,name', 'receiver:id,name']))], 201);
    }

    private function conversation($messages, int $userId): array
    {
        $first = $messages->first();
        $other = $first->sender_id === $userId ? $first->receiver : $first->sender;

        return [
            'thread_id' => $first->thread_id,
            'listing' => $first->listing,
            'participant' => $other,
            'messages' => $messages->map(fn ($message) => $this->message($message))->values()->all(),
        ];
    }

    private function message(Message $message): array
    {
        return [
            'id' => $message->id,
            'thread_id' => $message->thread_id,
            'listing_id' => $message->listing_id,
            'sender_id' => $message->sender_id,
            'receiver_id' => $message->receiver_id,
            'body' => $message->body,
            'read_at' => $message->read_at?->toISOString(),
            'created_at' => $message->created_at?->toISOString(),
        ];
    }
}