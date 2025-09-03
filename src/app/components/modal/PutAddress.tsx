import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import { searchDestinations, Destination } from "@/services/rajaongkirService";
import { updateAddress } from "@/services/addressService";
import { IAddress } from "@/app/components/inteface/IAddress";
import { IAddressParams } from "@/app/components/inteface/IAddressParams";

interface PutAddressProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  address: IAddress | null; // alamat yang mau diedit
}

const PutAddress: React.FC<PutAddressProps> = ({ 
  show, 
  onClose, 
  onSuccess,
  address
}) => {
  const [formData, setFormData] = useState<IAddressParams>({
    member_id: 0,
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

  // Isi form dari props.address
  useEffect(() => {
    if (address) {
      setFormData({
        member_id: address.MemberID ?? 0,
        title: address.Title ?? "",
        alamat: address.Alamat ?? "",
        kodepos: address.KodePos ?? "",
        kecamatan: address.Kecamatan ?? "",
        kota: address.Kota ?? "",
        provinsi: address.Provinsi ?? "",
        is_default: address.IsDefault ?? 0,
        province_id: address.ProvinceID ?? 0,
        city_id: address.CityID ?? 0,
        district_id: address.DistrictID ?? 0,
        subdistrict_id: address.SubDistrictID ?? 0,
      });
    }
  }, [address]);

  // Loader AsyncSelect
  const loadDestinationOptions = async (inputValue: string): Promise<Destination[]> => {
    if (!inputValue || inputValue.length < 3) return [];
    try {
      return await searchDestinations(inputValue);
    } catch (err) {
      console.error("Load destination error:", err);
      return [];
    }
  };

  // Handle pilih lokasi baru
  const handleDestinationSelect = (destination: Destination | null) => {
    setSelectedDestination(destination);
    if (destination) {
      setFormData(prev => ({
        ...prev,
        kecamatan: destination.district_name || "",
        kota: destination.city_name || "",
        provinsi: destination.province_name || "",
        kodepos: destination.zip_code || "",
      }));
    }
  };

  // Reset form saat close
  const resetForm = () => {
    if (address) {
      setFormData({
        member_id: address.MemberID ?? 0,
        title: address.Title ?? "",
        alamat: address.Alamat ?? "",
        kodepos: address.KodePos ?? "",
        kecamatan: address.Kecamatan ?? "",
        kota: address.Kota ?? "",
        provinsi: address.Provinsi ?? "",
        is_default: address.IsDefault ?? 0,
        province_id: address.ProvinceID ?? 0,
        city_id: address.CityID ?? 0,
        district_id: address.DistrictID ?? 0,
        subdistrict_id: address.SubDistrictID ?? 0,
      });
    }
    setSelectedDestination(null);
  };

  // Submit update
  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.alamat.trim()) {
      alert("Nama alamat dan Alamat lengkap wajib diisi");
      return;
    }
    if (!formData.provinsi || !formData.kota || !formData.kecamatan || !formData.kodepos) {
      alert("Provinsi, Kota, Kecamatan, dan Kode Pos wajib diisi");
      return;
    }

    try {
      setLoading(true);
      if (!address?.ID) throw new Error("Invalid address ID");

      const updated = await updateAddress(address.ID, formData);

      if (updated.ok) {
        onSuccess("Alamat berhasil diperbarui");
        onClose();
      } else {
        throw new Error(updated.message || "Gagal memperbarui alamat");
      }
    } catch (err: any) {
      console.error("Update address error:", err);
      alert(err.message || "Terjadi kesalahan saat update alamat");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show || !address) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Alamat</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            {/* Form sama seperti AddAddress */}
            <div className="mb-3">
              <label className="form-label">Nama Alamat</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Cari Lokasi</label>
              <AsyncSelect
                cacheOptions
                loadOptions={loadDestinationOptions}
                value={selectedDestination}
                onChange={handleDestinationSelect}
                placeholder="Cari lokasi..."
                isClearable
                isDisabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Alamat Lengkap</label>
              <textarea
                className="form-control"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Provinsi</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.provinsi}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Kota</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.kota}
                  onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Kecamatan</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Kode Pos</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.kodepos}
                  onChange={(e) => setFormData({ ...formData, kodepos: e.target.value })}
                  readOnly={!!selectedDestination}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={formData.is_default === 1}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked ? 1 : 0 })}
                disabled={loading}
              />
              <label className="form-check-label">Jadikan alamat default</label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
              Batal
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Menyimpan..." : "Update Alamat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PutAddress;
