import { Component } from '@angular/core';
import {NgForm} from "@angular/forms";
import {LoadingController, ModalController, ToastController} from "ionic-angular";
import {SetLocationPage} from "../set-location/set-location";
import {Location} from "../../models/location";
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {PlacesService} from "../../services/places";
import {Entry, File, FileError} from '@ionic-native/file';

declare var cordova: any;

@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {
  imageUrl = '';

  location: Location = {
    lat: -37.8136,
    lng: 144.9631
  };
  locationIsSet = false;

  constructor(private modalCtrl: ModalController,
              private geolocation: Geolocation,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private camera: Camera,
              private placesService: PlacesService,
              private file: File) {}

  onSubmit(form: NgForm) {
    // console.log(form.value);
    this.placesService.addPlace(
      form.value.title,
      form.value.description,
      this.location,
      this.imageUrl);
    form.reset();
    this.location = {
      lat: -37.8136,
      lng: 144.9631
    };
    this.imageUrl = '';
    this.locationIsSet = false;
  }

  onOpenMap() {
    const modal = this.modalCtrl.create(SetLocationPage, {location: this.location, isSet: this.locationIsSet});
    modal.present();
    modal.onDidDismiss(
      data => {
        if (data) {
          this.location = data.location;
          this.locationIsSet = true;
        }
      }
    );
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your Location...'
    });
    loader.present();
    this.geolocation.getCurrentPosition()
      .then(
        location => {
          loader.dismiss();
          this.location.lat = location.coords.latitude;
          this.location.lng = location.coords.longitude;
          this.locationIsSet = true;
        }
      )
      .catch(
        error => {
          loader.dismiss();
          // console.log(error);
          const toast = this.toastCtrl.create({
            message: 'Could not get location, please pick it manually!',
            duration: 2000
          });
          toast.present();
        }
      );
  }

  onTakePhoto() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options)
      .then(
        imageData => {
          const currentName = imageData.replace(/^.*[\\\/]/, '');
          const path = imageData.replace(/[^\/]*$/, '');
          this.file.moveFile(path, currentName, cordova.file.dataDirectory, currentName)
            .then(
              (data: Entry) => { //data will hold the new path, use nativeURL property to access it
                this.imageUrl = data.nativeURL;
                this.camera.cleanup();
                // this.file.removeFile(path, currentName); Alternative of camera.cleanup()
              }
            )
            .catch(
              (err: FileError)=> {
                this.imageUrl = '';
                const toast = this.toastCtrl.create({
                  message: 'Could not save the image. Please try again',
                  duration: 2000
                });
                toast.present();
                this.camera.cleanup();
              }
            );
          this.imageUrl = imageData;
          // console.log(imageData);
        }
      )
      .catch(
        err => {
          const toast = this.toastCtrl.create({
            message: 'Could not take the image. Please try again',
            duration: 2000
          });
          toast.present();
          // console.log(err);
        }
      );
  }
}
