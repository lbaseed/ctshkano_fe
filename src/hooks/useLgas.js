import { useQuery } from "@apollo/client";
import { GET_LGAS } from "../gql/lga";
import { useMemo } from "react";

export const useLgas = (activeOnly = true) => {
	const { data, loading, error, refetch } = useQuery(GET_LGAS, {
		variables: {
			isActive: activeOnly ? true : null,
			orderBy: "name",
			direction: "ASC"
		},
		fetchPolicy: "cache-and-network"
	});

	const lgaOptions = useMemo(() => {
		if (!data?.lgas) return [];

		return data.lgas.map((lga) => ({
			value: lga.id,
			label: lga.name,
			code: lga.code,
			uuid: lga.uuid,
			state: lga.state,
			tradersCount: lga.traders_count
		}));
	}, [data]);

	const getLgaByCode = (code) => {
		if (!data?.lgas || !code) return null;
		return data.lgas.find((lga) => lga.code === code);
	};

	const getLgaById = (id) => {
		if (!data?.lgas || !id) return null;
		return data.lgas.find((lga) => lga.id === id.toString());
	};

	const getLgaNameByCode = (code) => {
		const lga = getLgaByCode(code);
		return lga ? lga.name : code;
	};

	const getLgaNameById = (id) => {
		const lga = getLgaById(id);
		return lga ? lga.name : '';
	};

	return {
		lgas: data?.lgas || [],
		lgaOptions,
		loading,
		error,
		refetch,
		getLgaByCode,
		getLgaById,
		getLgaNameByCode,
		getLgaNameById
	};
};
