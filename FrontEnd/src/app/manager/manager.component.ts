import { Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Income } from 'src/@core/interfaces/income.interface';
import { IncomeService } from 'src/@core/services/manager/income.service';
import { DisplaytabsService } from 'src/@core/services/table/displaytabs.service';
import { BsDatepickerConfig, BsDatepickerViewMode, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { Subscription } from 'rxjs';
import {DatepickerService1} from 'src/@core/services/manager/datepicker.service'
@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit,OnDestroy {
  @ViewChild("dpp") lich: BsDatepickerDirective;

  incomes: Income[];
  TongChi:number = 0;
  ToTal:number = 0;
  theodoi:any;
  lich1:BsDatepickerDirective;
  loi:string;
  private sub: Subscription;
  bsValue: Date = new Date(2017, 7);
  minMode: BsDatepickerViewMode = 'month';
  Thang :number =11;
  Nam:number = 2018;
  ngay:number;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private incomeService: IncomeService,
    private titleService: Title,
    private tabNameService: DisplaytabsService,
    private datesvice: DatepickerService1,
  ) { this.tabNameService.setTabsName("THÁNG "+this.Thang);

}

  ngOnInit() {

    this.titleService.setTitle("MANAGEMENT");
    this.bsConfig = Object.assign({}, {
      minMode : this.minMode,containerClass:'theme-orange'
    });
    this.sub = this.datesvice.getdatePicker().subscribe(data=>{
      if(data!=null) this.bsValue=new Date(data);
      this.ToTal=0;this.Thang=this.bsValue.getMonth()+1 ;this.Nam=this.bsValue.getFullYear() ;
      this.getIncomeByMonth(this.Thang,this.Nam);
      this.tabNameService.setTabsName("THÁNG "+this.Thang);
    })
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }

  getIncomeByMonth(thang,nam){
    this.resetIncomes();
    this.incomeService.getIncomeByMonth(thang,nam).subscribe((incomes:Income[])=>{
      this.incomes = incomes;
      this.incomes.forEach(element => {
        this.ToTal += element.income;

    })
    })
  }

  resetIncomes(){
    this.incomes = null;
  }
}
