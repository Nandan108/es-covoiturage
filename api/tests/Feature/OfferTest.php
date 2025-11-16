<?php

namespace Tests\Feature;

use App\Mail\OfferAccessMail;
use App\Models\Offer;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

final class OfferTest extends ApiTestCase
{
    #[\Override]
    public function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->setUpFakeEvents(3);
    }

    public function testCanCreateOffer(): void
    {
        $event = $this->randomEvent();

        // make data randomly
        $offerData = [
            'name'            => fake()->name(),
            'email'           => fake()->unique()->safeEmail(),
            'email_is_public' => fake()->boolean(),
            'phone'           => fake()->phoneNumber(),
            'notes'           => fake()->sentence(),
            'pasngr_seats'    => fake()->numberBetween(1, 5),
            'driver_seats'    => fake()->numberBetween(1, 5),
            'address'         => fake()->address(),
            'lat'             => fake()->latitude(36, 66),
            'lng'             => fake()->longitude(-175, 18),
        ];

        $uri = route('events.offers.store', ['event' => $event->hashId]);
        $response = $this->postJson($uri, $offerData);
        $response->assertCreated();
        // assert the response contains the offer data plus an ID and eventHash
        $response->assertJsonStructure([
            'message',
            'offer' => ['id', 'eventHash', 'name', 'email', 'email_is_public', 'phone', 'notes', 'pasngr_seats', 'driver_seats', 'address', 'lat', 'lng', 'created_at', 'updated_at'],
        ])->assertJsonPath('offer.id', fn (mixed $id) => is_int($id));
        // assert the offer was created according to provided data
        $response->assertJsonPath('message', 'Offer created successfully');
        $response->assertJsonPath('offer.eventHash', $event->hashId);
        $response->assertJsonPath('offer.name', $offerData['name']);
        $response->assertJsonPath('offer.email', $offerData['email']);
        $response->assertJsonPath('offer.email_is_public', $offerData['email_is_public']);
        $response->assertJsonPath('offer.phone', $offerData['phone']);
        $response->assertJsonPath('offer.notes', $offerData['notes']);
        $response->assertJsonPath('offer.pasngr_seats', $offerData['pasngr_seats']);
        $response->assertJsonPath('offer.driver_seats', $offerData['driver_seats']);
        $response->assertJsonPath('offer.address', $offerData['address']);
        $response->assertJsonPath('offer.lat', $offerData['lat']);
        $response->assertJsonPath('offer.lng', $offerData['lng']);
        $response->assertJsonPath('edit_token', fn (?string $token) => is_string($token) && strlen($token) > 10);
        $response->assertJsonPath('expires_at', fn (?string $expires) => is_string($expires));

        Mail::assertSent(OfferAccessMail::class);
    }

    public function testCanPatchOffer(): void
    {
        $event = $this->randomEvent();
        $offer = $event->offers()->inRandomOrder()->firstOrFail();
        $token = $offer->issueOwnerToken(Carbon::now()->addDay());

        // make patch data randomly
        $offerData = [
            'name'         => fake()->name(),
            'email'        => fake()->unique()->safeEmail(),
            'phone'        => fake()->phoneNumber(),
            'notes'        => fake()->sentence(),
        ];

        $uri = route('events.offers.update', ['event' => $event->hashId, 'offer' => $offer->id]);
        $response = $this->patchJson($uri, $offerData, ['X-Offer-Token' => $token]);
        $response->assertOk();
        // assert the response contains the offer data plus an ID and eventHash
        $response->assertJsonStructure([
            'message',
            // response offer data should still be complete
            'offer' => ['id', 'event_id', 'name', 'email', 'email_is_public',
                'phone', 'notes', 'pasngr_seats', 'driver_seats', 'address',
                'lat', 'lng', 'created_at', 'updated_at'],
        ])->assertJsonPath('offer.id', fn (mixed $id) => is_int($id));
        // assert the offer was updated according to provided data
        $response->assertJsonPath('message', 'Offer updated successfully');
        $response->assertJsonPath('offer.id', $offer->id);
        $response->assertJsonPath('offer.name', $offerData['name']);
        $response->assertJsonPath('offer.email', $offerData['email']);
        $response->assertJsonPath('offer.phone', $offerData['phone']);
        $response->assertJsonPath('offer.notes', $offerData['notes']);
    }

    public function testCanDeleteOffer(): void
    {
        $event = $this->randomEvent();
        $offer = $event->offers()->inRandomOrder()->firstOrFail();
        $token = $offer->issueOwnerToken(Carbon::now()->addDay());

        $uri = route('events.offers.destroy', ['event' => $event->hashId, 'offer' => $offer->id]);
        $response = $this->deleteJson($uri, [], ['X-Offer-Token' => $token]);
        $response->assertStatus(200);

        // assert the offer was deleted
        $response->assertJsonPath('message', 'Offer deleted successfully');
        $this->assertDatabaseMissing('offers', ['id' => $offer->id]);
    }

    public function testUpdateRequiresToken(): void
    {
        $event = $this->randomEvent();
        $offer = $event->offers()->inRandomOrder()->firstOrFail();

        $uri = route('events.offers.update', ['event' => $event->hashId, 'offer' => $offer->id]);
        $this->patchJson($uri, ['name' => 'No token'])
            ->assertForbidden();
    }

    public function testDeleteRequiresToken(): void
    {
        $event = $this->randomEvent();
        $offer = $event->offers()->inRandomOrder()->firstOrFail();

        $uri = route('events.offers.destroy', ['event' => $event->hashId, 'offer' => $offer->id]);
        $this->deleteJson($uri)
            ->assertForbidden();
    }

    public function testLegacyOffersWithoutTokenCanBeUpdated(): void
    {
        $event = $this->randomEvent();
        $offer = $event->offers()->inRandomOrder()->firstOrFail();
        $offer->token_hash = null;
        $offer->token_expires_at = null;
        $offer->save();

        $uri = route('events.offers.update', ['event' => $event->hashId, 'offer' => $offer->id]);
        $this->patchJson($uri, ['name' => 'Legacy update'])
            ->assertOk();
    }

    public function testAdminCanModifyOffersWithoutOwnerToken(): void
    {
        $event = $this->randomEvent();
        $offerForUpdate = $event->offers()->inRandomOrder()->firstOrFail();
        $offerForDelete = $event->offers()->where('id', '!=', $offerForUpdate->id)->firstOrFail();

        $admin = User::factory()->create(['is_admin' => true]);

        $updateUri = route('events.offers.update', ['event' => $event->hashId, 'offer' => $offerForUpdate->id]);
        $this->actingAs($admin, 'admin')
            ->patchJson($updateUri, ['name' => 'Updated by admin'])
            ->assertOk()
            ->assertJsonPath('offer.name', 'Updated by admin');

        $deleteUri = route('events.offers.destroy', ['event' => $event->hashId, 'offer' => $offerForDelete->id]);
        $this->actingAs($admin, 'admin')
            ->deleteJson($deleteUri)
            ->assertOk();

        $this->assertDatabaseMissing('offers', ['id' => $offerForDelete->id]);
    }
}
