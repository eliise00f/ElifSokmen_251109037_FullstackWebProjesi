CREATE DATABASE IF NOT EXISTS pera_bilet_db;
USE pera_bilet_db;


CREATE TABLE IF NOT EXISTS 251109037_kullanicilar (
    e_id INT AUTO_INCREMENT PRIMARY KEY,
    e_isim VARCHAR(50) NOT NULL,
    e_soyisim VARCHAR(50) NOT NULL,
    e_eposta VARCHAR(100) UNIQUE NOT NULL,
    e_sifre VARCHAR(255) NOT NULL,
    e_telefon VARCHAR(20) NOT NULL,
    e_rol VARCHAR(10) DEFAULT 'kullanici'
);


CREATE TABLE IF NOT EXISTS 251109037_konserler (
    e_konser_id INT AUTO_INCREMENT PRIMARY KEY,
    e_tarih VARCHAR(50) NOT NULL,
    e_sehir VARCHAR(50) NOT NULL,
    e_mekan VARCHAR(100) NOT NULL,
    e_fiyat INT NOT NULL,
    e_durum VARCHAR(20) DEFAULT 'Bilet Al'
);


CREATE TABLE IF NOT EXISTS 251109037_biletler (
    e_bilet_id INT AUTO_INCREMENT PRIMARY KEY,
    e_kullanici_id INT,
    e_konser_id INT,
    e_alim_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (e_kullanici_id) REFERENCES 251109037_kullanicilar(e_id) ON DELETE CASCADE,
    FOREIGN KEY (e_konser_id) REFERENCES 251109037_konserler(e_konser_id) ON DELETE CASCADE
);


INSERT INTO 251109037_konserler (e_tarih, e_sehir, e_mekan, e_fiyat, e_durum) 
SELECT '12 Haziran 2026', 'İstanbul', 'Harbiye Cemil Topuzlu Açık Hava', 450, 'Bilet Al' WHERE NOT EXISTS (SELECT 1 FROM 251109037_konserler WHERE e_sehir='İstanbul');

INSERT INTO 251109037_konserler (e_tarih, e_sehir, e_mekan, e_fiyat, e_durum) 
SELECT '18 Haziran 2026', 'Ankara', 'Jolly Joker Ankara', 400, 'Bilet Al' WHERE NOT EXISTS (SELECT 1 FROM 251109037_konserler WHERE e_sehir='Ankara');

INSERT INTO 251109037_konserler (e_tarih, e_sehir, e_mekan, e_fiyat, e_durum) 
SELECT '25 Haziran 2026', 'İzmir', 'İzmir Kültürpark Açıkhava', 350, 'Bilet Al' WHERE NOT EXISTS (SELECT 1 FROM 251109037_konserler WHERE e_sehir='İzmir');