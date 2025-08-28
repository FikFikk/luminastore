import React, { useState, useEffect } from 'react';

// Mock API functions - replace with your actual service calls
const mockApiCall = (url, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url.includes('province')) {
        resolve([
          { id: '6', name: 'DKI JAKARTA' },
          { id: '11', name: 'JAWA TIMUR' },
          { id: '9', name: 'JAWA BARAT' }
        ]);
      } else if (url.includes('city')) {
        resolve([
          { id: '501', name: 'JAKARTA PUSAT', zip_code: '10110' },
          { id: '444', name: 'SURABAYA', zip_code: '60111' }
        ]);
      } else if (url.includes('district')) {
        resolve([
          { id: '5895', name: 'GUBENG' },
          { id: '5896', name: 'SUKOLILO' }
        ]);
      } else if (url.includes('sub-district')) {
        resolve([
          { id: '69315', name: 'GEBANG PUTIH', zip_code: '60117' },
          { id: '69316', name: 'AIRLANGGA', zip_code: '60115' }
        ]);
      }
    }, delay);
  });
};

const HierarchicalAddressForm = ({ onAddressComplete }) => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('');
  
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  
  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    subDistricts: false
  });

  const [addressForm, setAddressForm] = useState({
    title: '',
    alamat: '',
    kodepos: ''
  });

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadCities(selectedProvince);
      // Reset dependent selections
      setSelectedCity('');
      setSelectedDistrict('');
      setSelectedSubDistrict('');
      setCities([]);
      setDistricts([]);
      setSubDistricts([]);
    }
  }, [selectedProvince]);

  // Load districts when city changes
  useEffect(() => {
    if (selectedCity) {
      loadDistricts(selectedCity);
      // Reset dependent selections
      setSelectedDistrict('');
      setSelectedSubDistrict('');
      setDistricts([]);
      setSubDistricts([]);
    }
  }, [selectedCity]);

  // Load sub-districts when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadSubDistricts(selectedDistrict);
      // Reset dependent selections
      setSelectedSubDistrict('');
      setSubDistricts([]);
    }
  }, [selectedDistrict]);

  // Auto-fill postal code when sub-district is selected
  useEffect(() => {
    if (selectedSubDistrict) {
      const subDistrict = subDistricts.find(sd => sd.id === selectedSubDistrict);
      if (subDistrict && subDistrict.zip_code) {
        setAddressForm(prev => ({ ...prev, kodepos: subDistrict.zip_code }));
      }
    }
  }, [selectedSubDistrict, subDistricts]);

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const data = await mockApiCall('province');
      setProvinces(data);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadCities = async (provinceId) => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const data = await mockApiCall(`city/${provinceId}`);
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const loadDistricts = async (cityId) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const data = await mockApiCall(`district/${cityId}`);
      setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const loadSubDistricts = async (districtId) => {
    setLoading(prev => ({ ...prev, subDistricts: true }));
    try {
      const data = await mockApiCall(`sub-district/${districtId}`);
      setSubDistricts(data);
    } catch (error) {
      console.error('Error loading sub-districts:', error);
    } finally {
      setLoading(prev => ({ ...prev, subDistricts: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedProvince || !selectedCity || !selectedDistrict || !selectedSubDistrict) {
      alert('Mohon lengkapi semua pilihan alamat');
      return;
    }

    const selectedProvinceData = provinces.find(p => p.id === selectedProvince);
    const selectedCityData = cities.find(c => c.id === selectedCity);
    const selectedDistrictData = districts.find(d => d.id === selectedDistrict);
    const selectedSubDistrictData = subDistricts.find(sd => sd.id === selectedSubDistrict);

    const completeAddress = {
      ...addressForm,
      provinsi: selectedProvinceData?.name || '',
      kota: selectedCityData?.name || '',
      kecamatan: selectedDistrictData?.name || '',
      kelurahan: selectedSubDistrictData?.name || '',
      province_id: selectedProvince,
      city_id: selectedCity,
      district_id: selectedDistrict,
      sub_district_id: selectedSubDistrict
    };

    onAddressComplete(completeAddress);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label Alamat *
          </label>
          <input
            type="text"
            name="title"
            value={addressForm.title}
            onChange={handleInputChange}
            placeholder="Rumah, Kantor, dll."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provinsi *
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            disabled={loading.provinces}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loading.provinces ? 'Loading...' : 'Pilih Provinsi'}
            </option>
            {provinces.map(province => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kota/Kabupaten *
          </label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedProvince || loading.cities}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loading.cities ? 'Loading...' : 'Pilih Kota/Kabupaten'}
            </option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kecamatan *
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedCity || loading.districts}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loading.districts ? 'Loading...' : 'Pilih Kecamatan'}
            </option>
            {districts.map(district => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kelurahan *
          </label>
          <select
            value={selectedSubDistrict}
            onChange={(e) => setSelectedSubDistrict(e.target.value)}
            disabled={!selectedDistrict || loading.subDistricts}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loading.subDistricts ? 'Loading...' : 'Pilih Kelurahan'}
            </option>
            {subDistricts.map(subDistrict => (
              <option key={subDistrict.id} value={subDistrict.id}>
                {subDistrict.name}
              </option>
            ))}
          </select>
        </div>

        {/* Street Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat Lengkap *
          </label>
          <textarea
            name="alamat"
            value={addressForm.alamat}
            onChange={handleInputChange}
            placeholder="Jl. Contoh No. 123, RT/RW, Detail lainnya"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kode Pos *
          </label>
          <input
            type="text"
            name="kodepos"
            value={addressForm.kodepos}
            onChange={handleInputChange}
            placeholder="Otomatis terisi"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">
            Kode pos akan otomatis terisi setelah memilih kelurahan
          </p>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Simpan Alamat
        </button>
      </div>
    </div>
  );
};

export default HierarchicalAddressForm;