import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit, OnChanges, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DisplaytabsService } from 'src/@core/services/table/displaytabs.service';
import { Router } from '@angular/router';
import { TablesInfoService } from 'src/@core/services/table/tables-info.service';
import { JwtService } from 'src/@core/services/jwt.service';
import { AuthService } from 'src/@core/auth/auth.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsDatepickerDirective, BsDatepickerViewMode, BsDatepickerConfig } from 'ngx-bootstrap/datepicker/';
import { DatepickerService1 } from 'src/@core/services/manager/datepicker.service';
import { RolesService } from 'src/@core/services/manager/roles.service'
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @ViewChild("dp") lich: BsDatepickerDirective;
  public bsValue: Date = new Date(2018, 10);
  minMode: BsDatepickerViewMode = 'month';
  Thang: number = 11;
  Nam: number = 2018;
  bsConfig: Partial<BsDatepickerConfig>;

  backArrow = ['VIEW ORDER', 'DETAIL-RECIPE', 'DETAIL', 'ORDER LIST'];
  isNotityBell = false;
  isBackArrow = true;
  isEdit = false;
  tabsName = '';
  isOrderList = true;
  isManager = true;
  // modal
  modalRef: BsModalRef;
  message: string;
  constructor(
    private displayTabService: DisplaytabsService,
    private title: Title,
    private router: Router,
    private tableInfoService: TablesInfoService,
    private jwtService: JwtService,
    private datesvice: DatepickerService1,
    private autheService: AuthService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private rolesManager: RolesService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {

    this.displayTabService.getTabsName().subscribe(data => {
      if (data) {
        this.tabsName = data;
        setTimeout(() => {
          const _title = data.toUpperCase();
          if (_title === 'TABLE') {
            this.isNotityBell = true; this.isEdit = false; this.isManager = false;
          }
          else if (_title.indexOf('TAB') !== -1) {
            this.isEdit = true; this.isNotityBell = false; this.isManager = false;
          }
          else if (_title.indexOf('THÁNG') !== -1) {
            this.isManager = true;
          }
          else {
            this.isEdit = false; this.isNotityBell = false; this.isManager = false;
          }
          this.isBackArrow = this.backArrow.some(x => x === this.title.getTitle().toUpperCase());
        }, 0);
      } else {
        this.isEdit = false;
        this.isNotityBell = false;
        this.isManager = false;
      }
    });
    this.bsConfig = Object.assign({}, {
      minMode: this.minMode, containerClass: 'theme-orange'
    });
  }
  ngAfterViewInit() {
    this.InitCalendar_Header();
  }
  InitCalendar_Header() {
    this.lich.onHidden.subscribe(() => {
      this.datesvice.setdatePicker(this.bsValue.toDateString())
    });
  }

  onSignOut(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirm() {
    this.autheService.isLogin = false;
    this.jwtService.destroyToken();
    this.router.navigate(['auth']);
    localStorage.removeItem('first-list-product');
    this.modalRef.hide();
  }

  decline() {
    this.modalRef.hide();
  }

  navigate() {
    if (this.tabsName.toUpperCase() === 'ORDER LIST') {
      this.router.navigate(['/table']);
    } else if (this.tabsName.toUpperCase().indexOf('TAB') !== -1 || this.tabsName === '') {
      let subscription = this.tableInfoService.getTableId().subscribe(params => {
        this.tableInfoService.setClickedBack(true);
        this.router.navigate(['/order/order-list', params]);
      });
      subscription.unsubscribe();
    } else {
      this.router.navigate(['/menu']);
    }
  }

  quaManager() {
    this.rolesManager.isManager(localStorage.getItem('username'))
      .subscribe(isAdmin => {
        this.autheService.isManager = isAdmin;
        this.isManager = isAdmin;
        if (this.autheService.isLogin && this.isManager) {
          this.router.navigate(['/manager']);
          this.isNotityBell = false;
        }
        // if (this.isManager == false) {
        //   this.toastr.warning('Tính năng chỉ giành cho Người quản lý!');
        // }
      });

  }
}
