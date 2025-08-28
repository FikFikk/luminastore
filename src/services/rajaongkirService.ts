export interface Destination {
  value: string;
  label: string;
}

export const searchDestinations = async (
  keyword: string
): Promise<Destination[]> => {
  const res = await fetch(`/api/rajaongkir?search=${encodeURIComponent(keyword)}`);

  if (!res.ok) {
    throw new Error("Failed to fetch destinations");
  }

  const data = await res.json();

  // pastikan ada data array
  const list = data?.data ?? [];

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map((item: any) => ({
    value: item.subdistrict_id,
    label: `${item.subdistrict_name}, ${item.city_name}, ${item.province_name}`,
  }));
};
