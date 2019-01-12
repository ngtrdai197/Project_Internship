import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/@core/interfaces/user.interface';
import { Password } from 'src/@core/interfaces/password.interface';
import { UserService } from '../../../@core/services/user.service';
import { JwtService } from 'src/@core/services/jwt.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '115px',
        opacity: 1,
      })),
      state('closed', style({
        height: '0px',
        opacity: 0,
      })),
      transition('open => closed', [
        animate('0.4s')
      ]),
      transition('closed => open', [
        animate('0.4s')
      ]),
    ]),
  ],
})
export class UserComponent implements OnInit {
  user: User;
  public Edit: boolean = false;
  public Changepw: boolean = false;
  public isEdit: boolean = false;
  public isPW: boolean = false;
  public userName: string = this.jwtService.getUserName();
  public email: string;
  public fullname: string;
  public age: Date;
  public isGender: Boolean;
  public address: string;
  public phonenumber: string;
  public show: string; //test
  public pw: string;
  public oldpw: string;
  public newpw: string;
  public confirm: string;
  isAvatar = false;
  isOpen = false;
  passwordForm: FormGroup;
  toggle() {
    this.isOpen = !this.isOpen;
  }
  constructor(
    private passBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private userservice: UserService,
    private jwtService: JwtService,
  ) { }
  ngOnInit() {
    this.getUser();
    this.buildForm();
  }


  onChooseFile(event) {
    const file = event.target.files[0];
    const formData: FormData = new FormData();
    formData.append('avatar', file, file.name);
    this.userservice.uploadAvatar(formData).subscribe(data => {
      const pathUrl = 'http://localhost:8088/Avatars/'
      this.user.Avatar = pathUrl + data;
      this.userservice._updateUser(this.user).subscribe(_ => {
        this.isAvatar = true;
        this.toastr.success('Cập nhật hình thành công !');
      });
    })
  }


  onClickEdit() {
    this.isEdit = true;
    this.Edit = !this.Edit;
  }
  onClickSaveInfor() {
    this.isEdit = false;
    this.user.FullName = this.fullname;
    this.user.NamSinh = this.age;
    this.user.GioiTinh = this.isGender;
    this.user.DiaChi = this.address;
    this.user.DienThoai = this.phonenumber;
    this.userservice._updateUser(this.user).subscribe();
    this.toastr.success('Sửa thông tin thành công');
    this.show = this.user.DiaChi; ///test
    this.Edit = !this.Edit;
  }
  onClickSavePW() {
    const pass: Password = {
      OldPassword: this.oldpw,
      NewPassword: this.newpw,
      ConfirmPassword: this.confirm
    }
    this.userservice._changePassword(pass).subscribe(result => {
      this.toastr.success(result);
      this.isPW = false;
      this.oldpw = "";
      this.newpw = "";
      this.confirm = "";
      this.Changepw = !this.Changepw;
      this.toggle();
    }, (err) => {
      this.toastr.error('Mật khẩu cũ không đúng');
    });
  }
  onClickCancel() {
    this.isEdit = false;
    this.isPW = false;
    this.fullname = this.user.FullName;
    this.age = this.user.NamSinh;
    this.isGender = this.user.GioiTinh;
    this.address = this.user.DiaChi;
    this.phonenumber = this.user.DienThoai;
    this.oldpw = "";
    this.newpw = "";
    this.confirm = "";
    this.Edit = false;
    if (this.Changepw == true) {
      this.toggle();
    }
    this.Changepw = false;
  }
  ManGender() {
    this.isGender = true;
  }
  WomenGender() {
    this.isGender = false;
  }
  onClickPW() {
    this.isPW = true;
    this.Changepw = !this.Changepw;
    this.toggle();
  }
  onClickExit() {
    this.router.navigate(['table']);
  }
  getUser() {
    this.userservice._getUserByUserName(this.jwtService.getUserName()).subscribe((user1: User) => {
      this.user = user1;
      this.email = this.user.Email;
      this.fullname = this.user.FullName;
      this.age = this.user.NamSinh;
      this.isGender = this.user.GioiTinh;
      this.address = this.user.DiaChi;
      this.phonenumber = this.user.DienThoai;
      // an hien image user
      if (this.user.Avatar) {
        this.isAvatar = true;
      }
    });
  }
  private buildForm() {
    this.passwordForm = this.passBuilder.group({
      OldPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
      ]],

      NewPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
      ]],

      ConfirmPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$'), this.matchPassWord
      ]]
    });
  }


  matchPassWord(c: AbstractControl): any {
    if (!c.parent || !c) { return; }
    const pwd = c.parent.get('NewPassword');
    const cpwd = c.parent.get('ConfirmPassword');
    if (!pwd || !cpwd) { return; }
    if (pwd.value !== cpwd.value) {
      return { invalid: true };
    }
  }
}
