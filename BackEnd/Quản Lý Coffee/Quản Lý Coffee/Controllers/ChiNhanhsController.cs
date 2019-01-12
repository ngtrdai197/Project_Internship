using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using Quản_Lý_Coffee.Models;
using Quản_Lý_Coffee.Models.DTO;

namespace Quản_Lý_Coffee.Controllers
{
    public class ChiNhanhsController : ApiController
    {
        private QuanLyCoffeeDbContext db = new QuanLyCoffeeDbContext();

        // GET: api/ChiNhanhs/CostLastMonth
        [Authorize(Roles = "Admin")]
        [HttpGet]
        [ActionName("CostLastMonth")]
        public IHttpActionResult GetChiNhanhs()
        {
            var cost = db.HoaDonNhaps.Include("ChiNhanhs")
                                    .Where(s => s.NgayNhap.Month == DateTime.Today.Month - 1)
                                    .GroupBy(s => s.ChiNhanhID)
                                    .Select(hd => new ChiNhanhDTO { cost = hd.Sum(s => s.TongTienNhap), TenCN = hd.FirstOrDefault().ChiNhanh.TenCN, SDT = hd.FirstOrDefault().ChiNhanh.SDT, income = 0 }).ToList();
            if (cost.Count == 0)
            {
                return (NotFound());
            }
            else
            {
                return Ok(cost);
            }
        }

        // GET: api/ChiNhanhs/IncomeLastMonth
        [Authorize(Roles = "Admin")]
        [HttpGet]
        [ActionName("IncomeLastMonth")]
        public IHttpActionResult IncomeLastMonth()
        {
            var income = db.HoaDonXuats.Include("ChiNhanhs")
                                    .Where(s => s.NgayGio.Month == DateTime.Today.Month - 1)
                                    .GroupBy(s => s.ChiNhanhID)
                                    .Select(hd => new ChiNhanhDTO { income = hd.Sum(s => s.TongTien), TenCN = hd.FirstOrDefault().ChiNhanh.TenCN, SDT = hd.FirstOrDefault().ChiNhanh.SDT, cost = 0 }).ToList();
            if (income.Count == 0)
            {
                return (NotFound());
            }
            else
            {
                return Ok(income);
            }
        }
        // GET: api/ChiNhanhs/IncomeByMonth?m=2&&y=2018
        [Authorize(Roles ="Admin")]
        [HttpGet]
        [ActionName("IncomeByMonth")]
        public IHttpActionResult IncomeByMonth(int m,int y)
        {
            var income = db.HoaDonXuats.Include("ChiNhanhs")
                                    .Where(s => s.NgayGio.Month == m && s.NgayGio.Year == y)
                                    .GroupBy(s => s.ChiNhanhID)
                                    .Select(hd => new ChiNhanhDTO { income = hd.Sum(s => s.TongTien), TenCN = hd.FirstOrDefault().ChiNhanh.TenCN, SDT = hd.FirstOrDefault().ChiNhanh.SDT, cost = 0 }).ToList();
            if (income.Count == 0)
            {
                return (NotFound());
            }
            else
            {
                return Ok(income);
            }
        }

        //GET: api/ChiNhanhs/ManagerAuthor/?userName=
        [Authorize]
        [HttpGet]
        [ActionName("ManagerAuthor")]
        public IHttpActionResult ManagerAuthor(string userName)
        {
            bool isManager = false;

            if (User.Identity.Name == userName)
            {
                return Ok(User.IsInRole("Admin"));
            }

            return Ok(isManager);
        }




        // DELETE: api/ChiNhanhs/DeleteChiNhanh/6
        [HttpDelete]
        [ActionName("DeleteChiNhanh")]
        [ResponseType(typeof(ChiNhanh))]
        public IHttpActionResult DeleteChiNhanh(int id)
        {
            ChiNhanh chiNhanh = db.ChiNhanhs.Find(id);
            if (chiNhanh == null)
            {
                return NotFound();
            }

            db.ChiNhanhs.Remove(chiNhanh);
            db.SaveChanges();

            return Ok(chiNhanh);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

       
    }
}