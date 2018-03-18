import {Place} from "../models/place";
import {Location} from "../models/location";
import { NativeStorage } from '@ionic-native/native-storage';
import {Injectable} from "@angular/core";
import {File} from "@ionic-native/file";

declare var cordova: any;

@Injectable()
export class PlacesService {
  private places: Place[] = [];

  constructor(private nativeStorage: NativeStorage,
              private file: File) {}

  addPlace(title: string,
           description: string,
           location: Location,
           imageUrl: string) {
    const place = new Place(title, description, location, imageUrl);
    this.places.push(place);
    this.nativeStorage.setItem('places', this.places)
      .then()
      .catch(
        err => {
          this.places.splice(this.places.indexOf(place), 1);
        }
      );
  }

  loadPlace() {
    return this.places.slice();
  }

  fetchPlaces() {
    return this.nativeStorage.getItem('place') //return a promise
      .then(
        (places: Place[]) => {
          this.places = places != null ? places : [];
          return this.places.slice();
        }
      )
      .catch(
        err => console.log(err)
      );
  }

  deletePlace(index: number) {
    const place = this.places[index];
    this.places.splice(index, 1);
    this.nativeStorage.setItem('places', this.places)
      .then(
        () => {
          this.removeFile(place);
        }
      )
      .catch(
        err => console.log(err)
      );
  }

  private removeFile(place: Place) {
    const currentName = place.imageUrl.replace(/^.*[\\\/]/, '');
    this.file.removeFile(cordova.file.dataDirectory, currentName)
      .then(
        () => {
          console.log('Removed File');
        }
      )
      .catch(
        () => {
          console.log('Error while removing FIle');
          this.addPlace(place.title, place.description, place.location, place.imageUrl);
        }
      )
  }
}
