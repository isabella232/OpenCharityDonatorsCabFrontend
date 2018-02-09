// Typing for Ammap
/// <reference path="../shared/typings/ammaps/ammaps.d.ts" />

import { Component, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpService } from '../services/http-service';
import 'rxjs/add/operator/takeWhile';

import { matchingFileds } from '../components/validators/validators';
import { AlertModal } from '../modals/alert-modal/alert-modal.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

import { UserService } from '../services/user-service';


@Component({
    templateUrl: 'login.html',
    providers: [HttpService]
})

export class LoginComponent implements OnInit {

    loginForm: FormGroup;

    private httpAlive: boolean = true;

    constructor( private httpService: HttpService, private fb: FormBuilder, private userService: UserService) {}

    ngOnInit(){
      this.initForm();

      this.userService.removeUserDataLocal();
    }

    ngOnDestroy() {
      this.httpAlive = false;
    }

    initForm(){
      this.loginForm = this.fb.group({
       email: ['', [
        Validators.required,
        Validators.email
       ]
      ],
       pass: ['',
       Validators.required
      ]});
    }

      isControlInvalid(controlName: string): boolean {
        const control = this.loginForm.controls[controlName];

        const result = control.invalid && control.touched;

       return result;
      }

      loginFormSubmit() {
        const controls = this.loginForm.controls;
         if (this.loginForm.invalid) {
          Object.keys(controls)
           .forEach(controlName => controls[controlName].markAsTouched());
           return;
          }
          const data = {
            'email': this.loginForm.value['email'],
            'password': this.loginForm.value['pass']
          }
          this.httpService.httpPost(`${this.httpService.baseAPIurl}/api/user/login`, JSON.stringify(data))
              .takeWhile(() => this.httpAlive)
              .subscribe(
                response => {
                  this.loginForm.reset();
                  this.userService.setUserData(response.data);
                },
                error => {
                  console.log(error);
                });
        }

}
