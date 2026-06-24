# 🧪 Testing Checklist - Invoice Form

## ✅ Before Testing
- [ ] Buka halaman KamarPengelolaan / Tab Tagihan
- [ ] Pastikan ada sewa data yang aktif
- [ ] Buka browser console untuk check error

---

## 🎨 UI/UX Testing

### Visual Design
- [ ] Form tampil dengan card design yang modern
- [ ] Header berwarna purple gradient
- [ ] Total card memiliki highlight/accent color
- [ ] Border halus dan shadow terlihat jelas
- [ ] Spacing konsisten antar field

### Responsive Design
- [ ] Desktop (> 768px): Grid 2 kolom
- [ ] Tablet/Mobile (≤ 768px): Grid 1 kolom
- [ ] Button full width di mobile
- [ ] Semua text readable di mobile

### Input Styling
- [ ] Input field rounded corners
- [ ] Hover state: Border berubah warna
- [ ] Focus state: Purple border + blue shadow
- [ ] Placeholder text visible
- [ ] Disabled state styling jelas

---

## 📋 Field Testing

### Section 1: Informasi Tagihan

#### Deskripsi Tagihan
- [ ] Dropdown menampilkan semua opsi dari backend
- [ ] Bisa memilih deskripsi
- [ ] Wajib diisi (button disabled jika kosong)

#### Durasi (Conditional - "Biaya Kamar")
- [ ] Tampil HANYA jika Deskripsi = "Biaya Kamar"
- [ ] Opsi: Harian, Mingguan, Bulanan, Tahunan
- [ ] Tersembunyi untuk deskripsi lain
- [ ] Reset ke kosong saat ubah deskripsi

#### Tanggal Masuk (Conditional - "Biaya Kamar")
- [ ] Tampil HANYA jika Deskripsi = "Biaya Kamar"
- [ ] Date picker berfungsi
- [ ] Reset ke kosong saat ubah deskripsi

#### Tanggal Keluar (Conditional - "Biaya Kamar")
- [ ] Tampil HANYA jika Deskripsi = "Biaya Kamar"
- [ ] Date picker berfungsi
- [ ] Reset ke kosong saat ubah deskripsi

### Section 2: Perhitungan

#### Jumlah (Qty)
- [ ] Bisa input angka
- [ ] Min value 0
- [ ] Subtotal update real-time saat berubah
- [ ] Helper text "Subtotal: Rp ..." muncul

#### Harga Satuan
- [ ] Bisa input angka
- [ ] Min value 0, step 1000
- [ ] Subtotal update real-time saat berubah
- [ ] Helper text "Subtotal: Rp ..." menunjukkan nilai benar
- [ ] Format rupiah dengan thousand separator

### Section 3: Diskon (Optional)

#### Diskon Persen (%)
- [ ] Input number 0-100
- [ ] Disabled jika subtotal = 0
- [ ] Saat input nilai → Diskon Rupiah auto-calculate
- [ ] Formula: Diskon Rp = Subtotal × % / 100
- [ ] Helper text menampilkan nilai rupiah
- [ ] Max 100% - jika input > 100, auto-limit ke 100% + error message

#### Diskon Rupiah (Rp)
- [ ] Input number
- [ ] Disabled jika subtotal = 0
- [ ] Saat input nilai → Diskon Persen auto-calculate
- [ ] Formula: Diskon % = (Diskon Rp / Subtotal) × 100
- [ ] Helper text menampilkan nilai persen
- [ ] Max = Subtotal - jika input > subtotal, auto-limit + error message

#### Error Handling
- [ ] Error message tampil dengan icon ⚠️
- [ ] Input berubah red border saat error
- [ ] Submit button disabled jika ada error
- [ ] Error message hilang saat nilai dikoreksi

### Section 4: Total (Highlighted)

#### Total Card
- [ ] Tampil dengan gradient background (purple)
- [ ] Font besar dan prominent
- [ ] Format Rp dengan thousand separator
- [ ] Tidak editable (read-only)
- [ ] Auto-calculate: Total = Subtotal - Diskon Rp

#### Breakdown
- [ ] Subtotal ditampilkan jika > 0
- [ ] Diskon ditampilkan jika > 0
- [ ] Format: Subtotal - Diskon = Total

---

## 🔀 Conditional Logic Testing

### Scenario 1: Deskripsi = "Biaya Kamar"
1. Pilih "Biaya Kamar" dari dropdown
2. [ ] Durasi field muncul
3. [ ] Tanggal Masuk field muncul
4. [ ] Tanggal Keluar field muncul
5. [ ] Ketiga field tersebut wajib diisi
6. [ ] Submit button disabled sampai semua isi

### Scenario 2: Deskripsi ≠ "Biaya Kamar"
1. Pilih deskripsi lain (misal: Listrik, Air, dll)
2. [ ] Durasi field TIDAK muncul
3. [ ] Tanggal Masuk field TIDAK muncul
4. [ ] Tanggal Keluar field TIDAK muncul
5. [ ] Submit button bisa diklik dengan 3 field wajib saja

### Scenario 3: Ubah Deskripsi dari Kamar ke Lain
1. Pilih "Biaya Kamar" - field conditional muncul
2. Isi semua field conditional
3. Ubah deskripsi ke "Listrik"
4. [ ] Durasi di-reset
5. [ ] Tanggal Masuk di-reset
6. [ ] Tanggal Keluar di-reset
7. [ ] Diskon di-reset

---

## 🧮 Calculation Testing

### Test 1: Basic Calculation
1. Input: Jumlah = 10, Harga = 1.000.000
2. [ ] Subtotal = 10.000.000
3. [ ] Total = 10.000.000 (tanpa diskon)
4. [ ] Format dengan thousand separator

### Test 2: Diskon Persen → Rupiah Sync
1. Subtotal = 10.000.000
2. Input: Diskon Persen = 10%
3. [ ] Diskon Rupiah auto-calculate = 1.000.000
4. [ ] Total = 9.000.000

### Test 3: Diskon Rupiah → Persen Sync
1. Subtotal = 10.000.000
2. Input: Diskon Rupiah = 2.000.000
3. [ ] Diskon Persen auto-calculate = 20%
4. [ ] Total = 8.000.000

### Test 4: Edit Subtotal After Diskon Set
1. Set Diskon = 10% (Diskon Rp = 1.000.000)
2. Ubah Jumlah dari 10 menjadi 20 (Subtotal: 20.000.000)
3. [ ] Diskon Persen tetap 10%
4. [ ] Diskon Rupiah auto-update = 2.000.000
5. [ ] Total = 18.000.000

### Test 5: Zero Values
1. Input: Jumlah = 0, Harga = 1.000.000
2. [ ] Subtotal = 0
3. [ ] Diskon fields di-disable
4. [ ] Total = 0

---

## ✅ Validation Testing

### Test 1: Submit Tanpa Input
1. [ ] Submit button DISABLED (tidak bisa diklik)
2. [ ] Tombol terlihat greyed out

### Test 2: Submit Dengan Deskripsi Saja
1. Isi hanya Deskripsi Tagihan
2. [ ] Submit button DISABLED
3. [ ] Message: "Semua field wajib diisi"

### Test 3: Submit Tanpa Deskripsi
1. Isi Jumlah, Harga Satuan
2. [ ] Submit button DISABLED
3. [ ] Tidak bisa submit

### Test 4: Biaya Kamar - Submit Tanpa Conditional
1. Pilih "Biaya Kamar"
2. Isi: Jumlah, Harga Satuan
3. TIDAK isi: Durasi, Tanggal Masuk/Keluar
4. [ ] Submit button DISABLED
5. [ ] Baru enabled setelah isi semua 3 field

### Test 5: Diskon > Subtotal
1. Subtotal = 1.000.000
2. Input Diskon Rupiah = 2.000.000
3. [ ] Error message muncul: "Diskon tidak boleh melebihi subtotal..."
4. [ ] Input berubah red border
5. [ ] Diskon Rupiah di-limit ke 1.000.000
6. [ ] Submit button disabled

### Test 6: Diskon Persen > 100%
1. Input Diskon Persen = 150%
2. [ ] Error message muncul: "Diskon tidak boleh melebihi 100%"
3. [ ] Input berubah red border
4. [ ] Diskon Persen di-limit ke 100%
5. [ ] Submit button disabled

---

## 💾 Submit Testing

### Test 1: Successful Submit
1. Isi semua field wajib dengan data valid
2. [ ] Submit button ENABLED
3. Klik Submit button
4. [ ] Button berubah: "Menyimpan..." + spinner
5. [ ] Form data terkirim ke parent component
6. [ ] Total field sudah berisi calculated value

### Test 2: Submit dengan Biaya Kamar
1. Deskripsi = "Biaya Kamar"
2. Isi semua fields (termasuk conditional)
3. Klik Submit
4. [ ] Data includenya: durasi, tanggalMasuk, tanggalKeluar
5. [ ] Total calculated dengan benar

### Test 3: Submit dengan Diskon
1. Isi form dengan diskon
2. Klik Submit
3. [ ] diskonPersen ter-send
4. [ ] diskonRupiah ter-send
5. [ ] total = subtotal - diskonRupiah

---

## 🔧 Edge Cases

### Test 1: Format Rupiah
- [ ] 1000 → Rp 1.000
- [ ] 1000000 → Rp 1.000.000
- [ ] 1000000000 → Rp 1.000.000.000
- [ ] 0 → Rp 0

### Test 2: Decimal Values
1. Input Diskon Persen = 10.5%
2. [ ] Diskon Rupiah calculate dengan benar
3. [ ] Tidak ada rounding error yang jelas

### Test 3: Very Large Numbers
1. Jumlah = 999999
2. Harga = 999999999
3. [ ] Tidak crash
4. [ ] Calculation benar

### Test 4: Rapid Changes
1. Ubah Jumlah berkali-kali dengan cepat
2. [ ] Calculation tetap real-time
3. [ ] Tidak ada delay/lag

---

## 📱 Mobile Testing

- [ ] Form render dengan baik di mobile
- [ ] Grid 1 kolom
- [ ] Input field ukuran touch-friendly
- [ ] Button full width
- [ ] Total card masih prominent
- [ ] Scroll tidak ada issue

---

## 🐛 Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari

---

## 📝 Notes

- Jika ada bug, check browser console untuk error
- Pastikan backend sudah provide deskripsi options
- Test dengan berbagai kombinasi input
- Perhatikan format rupiah di setiap skenario
