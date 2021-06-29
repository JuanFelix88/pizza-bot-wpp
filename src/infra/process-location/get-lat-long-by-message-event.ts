import { GetLatLongError } from '@/presentation/errors/get-lat-long'

class GetLatLongByMessageEvent {
  public extract (event: GetLatLongByMessageEvent.MessageEvent): [number, number] {
    if (typeof event.lat !== 'number' || typeof event.lng !== 'number') { throw new GetLatLongError() }

    return [event.lat, event.lng]
  }
}

namespace GetLatLongByMessageEvent {
  export interface MessageEvent {
    type: 'location',
    lat: number;
    lng: number;
  }

}

export const getLatLongByMessageEvent = new GetLatLongByMessageEvent()
