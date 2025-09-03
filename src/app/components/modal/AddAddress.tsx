import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { searchDestinations, Destination } from "@/services/rajaongkirService";
import { 
  createMemberAddress,
} from "@/services/addressService";

interface AddressFormData {
  title: string;
  alamat: string;
  kodepos: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  is_default: number;
  province_id: number;
  city_id: number;
  district_id: number;
  subdistrict_id: number;
}

interface AddAddressProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
}

const AddAddress: React.FC<AddAddressProps> = ({ 
  show, 
  onClose, 
  onSuccess 
}) => {
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    title: "",
    alamat: "",
    kodepos: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    is_default: 0,
    province_id: 0,
    city_id: 0,
    district_id: 0,
    subdistrict_id: 0,
  });
  
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);

  // AsyncSelect loader untuk destination search
  const loadDestinationOptions = async (inputValue: string): Promise<Destination[]> => {
    if (!inputValue || inputValue.length < 3) return [];
    
    try {
      const results = await searchDestinations(inputValue);
      return results;
    } catch (err: any) {
      console.error("Load destination options error:", err);
      return [];
    }
  };

  // Handle destination selection
  const handleDestinationSelect = (destination: Destination | null) => {
    setSelectedDestination(destination);
    
    if (destination) {
      setAddressForm(prev => ({
        ...prev,
        kecamatan: destination.district_name || '',
        kota: destination.city_name || '',
        provinsi: destination.province_name || '',
        kodepos: destination.zip_code || '',
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedDestination(null);
    setAddressForm({
      title: "",
      alamat: "",
      kodepos: "",
      kecamatan: "",
      kota: "",
      provinsi: "",
      is_default: 0,
      province_id: 0,
      city_id: 0,
      district_id: 0,
      subdistrict_id: 0,
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!addressForm.title.trim()) {
      alert("Nama alamat harus diisi");
      return;
    }
    if (!addressForm.alamat.trim()) {
      alert("Alamat lengkap harus diisi");
      return;
    }
    if (!addressForm.provinsi.trim() || !addressForm.kota.trim() || 
        !addressForm.kecamatan.trim() || !addressForm.kodepos.trim()) {
      alert("Provinsi, Kota, Kecamatan, dan Kode Pos harus diisi");
      return;
    }

    try {
      setLoading(true);
      
      const memberId = 1;
      
      const newAddress = await createMemberAddress({
        member_id: memberId,
        title: addressForm.title,
        alamat: addressForm.alamat,
        kodepos: addressForm.kodepos,
        kecamatan: addressForm.kecamatan,
        kota: addressForm.kota,
        provinsi: addressForm.provinsi,
        is_default: addressForm.is_default,
        province_id: 0,
        city_id: 0,
        district_id: 0,
        subdistrict_id: 0,
      });
      
      resetForm();
      onSuccess("Alamat berhasil ditambahkan");
      onClose();
      
    } catch (err: any) {
      console.error("Error creating address:", err);
      alert(err.message || "Gagal menambah alamat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tambah Alamat Baru</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Nama Alamat */}
            <div className="mb-3">
              <label className="form-label">
                Nama Alamat <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={addressForm.title}
                onChange={(e) => setAddressForm({ 
                  ...addressForm, 
                  title: e.target.value 
                })}
                placeholder="Rumah, Kantor, dll"
                disabled={loading}
              />
            </div>

            {/* Cari Lokasi */}
            <div className="mb-3">
              <label className="form-label">Cari Lokasi</label>
              <AsyncSelect
                cacheOptions
                defaultOptions={false}
                loadOptions={loadDestinationOptions}
                value={selectedDestination}
                onChange={handleDestinationSelect}
                placeholder="Ketik minimal 3 karakter untuk mencari..."
                isClearable
                isDisabled={loading}
                noOptionsMessage={({ inputValue }) => 
                  inputValue.length < 3 
                    ? "Ketik minimal 3 karakter" 
                    : "Tidak ada hasil ditemukan"
                }
                loadingMessage={() => "Mencari..."}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '38px'
                  })
                }}
              />
              <small className="text-muted">
                Pilih lokasi untuk otomatis mengisi provinsi, kota, kecamatan, dan kode pos
              </small>
            </div>

            {/* Alamat Lengkap */}
            <div className="mb-3">
              <label className="form-label">
                Alamat Lengkap <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                value={addressForm.alamat}
                onChange={(e) => setAddressForm({ 
                  ...addressForm, 
                  alamat: e.target.value 
                })}
                placeholder="Jalan, Nomor Rumah, RT/RW, dll"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Provinsi & Kota */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Provinsi <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={addressForm.provinsi}
                  onChange={(e) => setAddressForm({ 
                    ...addressForm, 
                    provinsi: e.target.value 
                  })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                  style={{ 
                    backgroundColor: selectedDestination ? '#f8f9fa' : 'white' 
                  }}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Kota <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={addressForm.kota}
                  onChange={(e) => setAddressForm({ 
                    ...addressForm, 
                    kota: e.target.value 
                  })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                  style={{ 
                    backgroundColor: selectedDestination ? '#f8f9fa' : 'white' 
                  }}
                />
              </div>
            </div>

            {/* Kecamatan & Kode Pos */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Kecamatan <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={addressForm.kecamatan}
                  onChange={(e) => setAddressForm({ 
                    ...addressForm, 
                    kecamatan: e.target.value 
                  })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                  style={{ 
                    backgroundColor: selectedDestination ? '#f8f9fa' : 'white' 
                  }}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Kode Pos <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={addressForm.kodepos}
                  onChange={(e) => setAddressForm({ 
                    ...addressForm, 
                    kodepos: e.target.value 
                  })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                  style={{ 
                    backgroundColor: selectedDestination ? '#f8f9fa' : 'white' 
                  }}
                />
              </div>
            </div>

            {/* Default Checkbox */}
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={addressForm.is_default === 1}
                onChange={(e) => setAddressForm({ 
                  ...addressForm, 
                  is_default: e.target.checked ? 1 : 0 
                })}
                disabled={loading}
              />
              <label className="form-check-label">
                Jadikan alamat default
              </label>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Menyimpan...
                </>
              ) : (
                "Simpan Alamat"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;