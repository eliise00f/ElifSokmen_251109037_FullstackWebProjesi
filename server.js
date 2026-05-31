//Hocam gerekli kütüphaneleri ve node.js'i projeye dahil ettim
const express = require('express');
const path = require('path');
const session = require('express-session');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

//tarayıcılar CSS, resim ve JS dosyalarını public içinden çeksin diye burayı statik yaptım
app.use(express.static('public'));

//kullanıcı giriş/kayıt yaparken formdan gelen verileri backend'de yakalamak için bu iki satırı ekledim
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//express-session paketi ile session ayarlarını yapıyorum, giriş yapmayanları admin'e giremeyecek
app.use(session({
    secret: '251109037_pera_ozel_anahtar',
    resave: false,
    saveUninitialized: true
}));


//burada xampp üzerindeki MySQL sunucuma bağlanmak için gerekli bilgileri tanımladım
const e_veritabani = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'pera_bilet_db',
    port: 3307 
});


e_veritabani.connect((err) => {
    if (err) {
        console.error('Veritabanına Bağlantı Başarısız: ' + err.stack);
        return;
    }
    console.log('Veritabanına bağlantı başarıyla sağlandı!');
});



//tarayıcıdan ana adres istendiğinde public klasöründeki anasayfa'yı tetikliyoruz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//konserler linkine tıklandığında turne tablosunun olduğu sayfayı kullanıcıya veren endpoint
app.get('/konserler', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'konserler.html'));
});

//kullanıcı sisteme girmek veya üye olmak istediğinde bu rotayı çağırıp formu çıkartıyoruz
app.get('/kullanici-giris', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kullanici-giris.html'));
});

//iletişim sayfasındaki harita ve FontAwesome ikonlu form alanını yükleyen sayfa rotası
app.get('/iletisim', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'iletisim.html'));
});




app.post('/api/251109037/kayit-ol', (req, res) => {
    
    const { e_kayit_isim, e_kayit_soyisim, e_kayit_eposta, e_kayit_sifre, e_kayit_telefon } = req.body;


    const e_sorgu = `INSERT INTO 251109037_kullanicilar (e_isim, e_soyisim, e_eposta, e_sifre, e_telefon) VALUES (?, ?, ?, ?, ?)`;
    
    e_veritabani.query(e_sorgu, [e_kayit_isim, e_kayit_soyisim, e_kayit_eposta, e_kayit_sifre, e_kayit_telefon], (err, e_sonuc) => {
        if (err) {
            console.error("Kayıt eklenirken veritabanı hata verdi: ", err);
            return res.status(500).send("Kayıt sırasında bir hata oluştu veya bu e-posta zaten kullanımda!");
        }
        
        //kullanıcı başarıyla kayıt olunca tarayıcıyı otomatik olarak giriş yapabileceği sayfaya yönlendiriyorum
        res.send(`
            <script>
                alert('Tebrikler! Pera Bilet Sistemine başarıyla kayıt oldunuz. Şimdi giriş yapabilirsiniz.');
                window.location.href = '/kullanici-giris';
            </script>
        `);
    });
});







app.post('/api/251109037/giris-yap', (req, res) => {
    const { e_giris_eposta, e_giris_sifre } = req.body;
    
    const e_sorgu = `SELECT * FROM 251109037_kullanicilar WHERE e_eposta = ? AND e_sifre = ?`;

    e_veritabani.query(e_sorgu, [e_giris_eposta, e_giris_sifre], (err, e_sonuclar) => {
        if (err) {
            console.error("Giriş sorgusunda hata çıktı: ", err);
            return res.status(500).send("Giriş yapılırken sunucu hatası oluştu.");
        }

        if (e_sonuclar.length > 0) {
            const e_kullanici = e_sonuclar[0];
        
            req.session.kullanici = {
                e_id: e_kullanici.e_id,
                e_isim: e_kullanici.e_isim,
                e_soyisim: e_kullanici.e_soyisim,
                e_rol: e_kullanici.e_rol
            };
            res.send(`<script>alert('Hoş geldiniz, ${e_kullanici.e_isim}! Başarıyla giriş yapıldı.'); window.location.href = '/';</script>`);
        } else {
            res.send(`<script>alert('E-posta veya şifre hatalı! Lütfen tekrar deneyin.'); window.location.href = '/kullanici-giris';</script>`);
        }
    });
});







app.get('/api/251109037/konserler', (req, res) => {

    const e_sorgu = "SELECT * FROM 251109037_konserler";
    
    e_veritabani.query(e_sorgu, (err, e_sonuclar) => {
        if (err) {
            console.error("Konserler veritabanından çekilemedi: ", err);
            return res.status(500).json({ hata: "Veri çekme hatası" });
        }

        res.json(e_sonuclar);
    });
});






app.get('/admin', (req, res) => {
    if (req.session.kullanici && req.session.kullanici.e_rol === 'admin') {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } else {
        res.send(`<script>alert('Bu alana sadece admin yetkisi olanlar girebilir!'); window.location.href = '/kullanici-giris';</script>`);
    }
});


app.post('/api/251109037/konserler', (req, res) => {
    const { e_tarih, e_sehir, e_mekan, e_fiyat, e_durum } = req.body;
    const e_sorgu = "INSERT INTO 251109037_konserler (e_tarih, e_sehir, e_mekan, e_fiyat, e_durum) VALUES (?, ?, ?, ?, ?)";
    e_veritabani.query(e_sorgu, [e_tarih, e_sehir, e_mekan, e_fiyat, e_durum], (err, e_sonuc) => {
        if (err) return res.status(500).json({ hata: err.message });
        res.json({ mesaj: "Konser başarıyla eklendi!" });
    });
});


app.delete('/api/251109037/konserler/:id', (req, res) => {
    const { id } = req.params;
    const e_sorgu = "DELETE FROM 251109037_konserler WHERE e_konser_id = ?";
    e_veritabani.query(e_sorgu, [id], (err, e_sonuc) => {
        if (err) return res.status(500).json({ hata: err.message });
        res.json({ mesaj: "Konser başarıyla silindi!" });
    });
});



app.listen(PORT, () => {
    console.log(`sunucu http://localhost:${PORT} adresinde çalışıyor`);
});