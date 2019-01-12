import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TablesInfoService } from 'src/@core/services/table/tables-info.service';
import { DisplaytabsService } from 'src/@core/services/table/displaytabs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TableOrderService } from 'src/@core/services/table/tb-order.service';
import { Product } from 'src/@core/interfaces/product.interface';
import { Bill } from 'src/@core/interfaces/bill.interface';
import { BillService } from 'src/@core/services/bills/bill.service';
import { CTHDService } from 'src/@core/services/bills/CTHD.service';
import { ToastrService } from 'ngx-toastr';
import { CTHD } from 'src/@core/interfaces/billdetail.interface';
import { TablesService } from 'src/@core/services/table/tables.service';
import { Table } from 'src/@core/interfaces/table.interface';

@Component({
  selector: 'app-view-order',
  templateUrl: './view-order.component.html',
  styleUrls: ['./view-order.component.scss']
})
export class ViewOrderComponent implements OnInit, OnDestroy {

  customerName = '';
  newProductOrder: Product[] = [];
  _orderingInfo: any;
  private products: Product[];
  checkOrder = true; // kiểm tra đã bấm order hay chưa ?
  checkQuantity = false; // ktra so luong sp cua thay doi ko ?
  dataProductLocal: Product[] = [];
  constructor(
    private title: Title,
    private tableinforService: TablesInfoService, private tbOrderSerivce: TableOrderService, private tableService: TablesService,
    private activatedRoute: ActivatedRoute, private toastr: ToastrService,
    private tbOrderService: TableOrderService,
    private billService: BillService, private CTHDService: CTHDService, private router: Router

  ) { }

  ngOnInit() {
    this.title.setTitle('VIEW ORDER');
    this.tableinforService.setTableId(+this.activatedRoute.snapshot.params.id); // quay vể order-list của bàn hiện tại
    this.tableinforService.getCustomerName().subscribe(customer => this.customerName = customer);
    this.onOrdered();
  }

  onOrdered() {
    this.tbOrderService.getNewOrder().subscribe(x => this.newProductOrder = x);
    let subscription = this.tbOrderService.getTableOrders().subscribe(data => {
      this.products = data;
      this.dataProductLocal = JSON.parse(localStorage.getItem('first-list-product'));
    });
    for (let i = 0; i < this.dataProductLocal.length; i++) {
      if (this.dataProductLocal[i].SanPhamID === this.products[i].SanPhamID) {
        if (this.dataProductLocal[i].SoLuong < this.products[i].SoLuong) {
          this.dataProductLocal[i].isChanged = true;
          this.dataProductLocal[i].SoLuong = this.products[i].SoLuong;
          this.checkQuantity = true; // nếu sp nào có số lượng thay đổi => false -> true
        }
      }
    }
    console.log(this.products);
    this.dataProductLocal.map(index => {
      if (index.isChanged) {
        console.log(index);
      }
    })
    subscription.unsubscribe();
    this.tbOrderSerivce.getOrderingInfo().subscribe(data => {
      this._orderingInfo = data;
    }); // ds tất cả sp, nếu có sp số lượng > 0 thì thêm vào stream
  }

  onViewOrderOrderNow() {
    const tableID = +this.activatedRoute.snapshot.params.id;
    // lấy hóa đơn theo id bàn
    this.billService.getBillByIdTable(tableID).subscribe((data: Bill) => {
      if (data.BanID && data.DaThanhToan == false) {
        // update chi tiết hóa đơn lưu lên server HoaDonXuatID
        let newBill: any = {
          HoaDonXuatID: data.HoaDonXuatID,
          BanID: tableID,
          DaThanhToan: false,
          ChiNhanhID: data.ChiNhanhID,
          HinhThucThanhToan: 'Tiền mặt',
          TongTien: this._orderingInfo.totalPayment,
          TenKhachHang: data.TenKhachHang
        };
        // update lại số lượng sản phẩm (sản phẩm đã được order)
        this.billService.updateBill(newBill).subscribe(() => {
          // nếu cart vừa thêm mới 1 sp & update thêm số lượng sp đã order
          if (this.newProductOrder.length > 0 && this.checkQuantity === true) {
            this.dataProductLocal.map(itemLocal => {
              if (itemLocal.isChanged === true) {
                console.log('isChang: '+itemLocal.SoLuong);

                  let newBillDetail: any = {
                    HoaDonXuatID: data.HoaDonXuatID,
                    SanPhamID: itemLocal.SanPhamID,
                    SoLuong: itemLocal.SoLuong
                  }
                  this.CTHDService.updateBilLDetail(newBillDetail).subscribe();
              }
            })
            for (let itemX of this.newProductOrder) {
              let newBillDetail: any = {
                HoaDonXuatID: data.HoaDonXuatID,
                SanPhamID: itemX.SanPhamID,
                SoLuong: itemX.SoLuong
              }
              this.CTHDService.createBillDetail(newBillDetail).subscribe();
            }
          }
          // cart chỉ có thêm sp -> ko tăng số lượng sp đã order
          else if (this.newProductOrder.length > 0) {
            console.log(this.newProductOrder);
            for (let itemX of this.newProductOrder) {
              let newBillDetail: any = {
                HoaDonXuatID: data.HoaDonXuatID,
                SanPhamID: itemX.SanPhamID,
                SoLuong: itemX.SoLuong
              }
              this.CTHDService.createBillDetail(newBillDetail).subscribe();
            }
          }
          // cart chỉ tăng số lượng sp đã order và ko có sp mới nào đc order thêm
          else {
            for (let itemOrder of this.products) {
              let newBillDetail: any = {
                HoaDonXuatID: data.HoaDonXuatID,
                SanPhamID: itemOrder.SanPhamID,
                SoLuong: itemOrder.SoLuong
              }
              this.CTHDService.updateBilLDetail(newBillDetail).subscribe();
            }
          }
          this.toastr.success('Order thành công', 'Thông báo');
          this.router.navigate(['order/order-list', tableID]);
          this.tbOrderService.onDestroyNewOrders(); // thêm sản phẩm mới thành công -> reset lại mảng newOrders
          this.router.navigate(['order/order-list', tableID]);
        }); // update số tiền
      }
    }, (err) => {
      // không tồn tại bàn trên hóa đơn xuất => tạo mới hđx theo bàn
      //tạo hóa đơn lưu lên server
      let newBill: Bill = {
        BanID: tableID,
        ChiNhanhID: 1,
        DaThanhToan: false,
        HinhThucThanhToan: 'Tiền mặt',
        NgayGio: new Date(Date.now()),
        TongTien: this._orderingInfo.totalPayment,
        TenKhachHang: this.customerName
      };
      this.billService.createBill(newBill).subscribe(data => {
        // tạo chi tiết hóa đơn lưu lên server HoaDonXuatID
        for (let itemOrder of this.products) {
          let newBillDetail: CTHD = {
            HoaDonXuatID: data.HoaDonXuatID,
            SanPhamID: itemOrder.SanPhamID,
            SoLuong: itemOrder.SoLuong,
          }
          this.CTHDService.createBillDetail(newBillDetail).subscribe();
        }
        const table: Table = {
          BanID: tableID,
          Status: 4
        }
        this.tableService.updateTable(table).subscribe(); // update trạng thái của bàn
      });
      this.toastr.success('Order thành công', 'Thông báo');
      // this.router.navigate(['table']);
      this.router.navigate(['order/order-list', tableID]);
      this.tbOrderService.destroyTableOrders();
        this.tbOrderService.onDestroyNewOrders(); // thêm sản phẩm mới thành công -> reset lại mảng newOrders

        this.router.navigate(['order/order-list', tableID]);
    });
    this.checkOrder = false; // click order rồi ko đc bấm tiếp nữa
  }
  ngOnDestroy() {
    console.clear();
  }
}
