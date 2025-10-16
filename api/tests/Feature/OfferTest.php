<?php

namespace Tests\Feature;

use App\Models\Offer;

final class OfferTest extends ApiTestCase
{
    #[\Override]
    public function setUp(): void
    {
        parent::setUp();
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
    }

    public function testCanPatchOffer(): void
    {
        $event = $this->randomEvent();
        $offer = $event->offers()->inRandomOrder()->firstOrFail();

        // make patch data randomly
        $offerData = [
            'name'         => fake()->name(),
            'email'        => fake()->unique()->safeEmail(),
            'phone'        => fake()->phoneNumber(),
            'notes'        => fake()->sentence(),
        ];

        $uri = route('events.offers.update', ['event' => $event->hashId, 'offer' => $offer->id]);
        $response = $this->patchJson($uri, $offerData);
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

        $uri = route('events.offers.destroy', ['event' => $event->hashId, 'offer' => $offer->id]);
        $response = $this->deleteJson($uri);
        $response->assertStatus(200);

        // assert the offer was deleted
        $response->assertJsonPath('message', 'Offer deleted successfully');
        $this->assertDatabaseMissing('offers', ['id' => $offer->id]);
    }
}
