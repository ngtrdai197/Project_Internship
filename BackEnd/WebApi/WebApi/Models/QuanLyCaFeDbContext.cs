using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
    public class QuanLyCaFeDbContext :DbContext
    {
        public QuanLyCaFeDbContext(): base("CoffeeDbContext")
        {

        }
         
        public DbSet<ChiNhanh>   ChiNhanhs  { get; set; }
        public DbSet<NhanVien>   NhanViens  { get; set; }
        public DbSet<LoaiSP>     LoaiSPs    { get; set; }
        public DbSet<SanPham>    SanPhams   { get; set; }
        public DbSet<HoaDonXuat> HoaDonXuats { get; set; }
        public DbSet<HoaDonNhap> HoaDonNhaps { get; set; }
        public DbSet<NguyenLieu> NguyenLieus { get; set; }
        #region // tiep.
        public DbSet<TonKho>     TonKhos     { get; set; }
        public DbSet<ChiTietHD> ChiTietHDs { get; set; }
        public DbSet<KhachHang>  KhachHangs  { get; set; }
        #endregion
        public DbSet<Ban>        Bans { get; set; }

    }
}