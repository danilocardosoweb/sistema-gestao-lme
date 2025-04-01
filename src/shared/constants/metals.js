export const METALS = {
    ALUMINIO: {
        key: 'aluminio',
        label: 'Alumínio',
        unit: 'USD/ton',
        precision: 2
    },
    COBRE: {
        key: 'cobre',
        label: 'Cobre',
        unit: 'USD/ton',
        precision: 2
    },
    ZINCO: {
        key: 'zinco',
        label: 'Zinco',
        unit: 'USD/ton',
        precision: 2
    },
    CHUMBO: {
        key: 'chumbo',
        label: 'Chumbo',
        unit: 'USD/ton',
        precision: 2
    },
    NIQUE: {
        key: 'niquel',
        label: 'Níquel',
        unit: 'USD/ton',
        precision: 2
    },
    ESTANHO: {
        key: 'estanho',
        label: 'Estanho',
        unit: 'USD/ton',
        precision: 2
    },
    DOLAR_PTAX: {
        key: 'dolar_ptax',
        label: 'Dólar PTAX',
        unit: 'BRL/USD',
        precision: 4
    }
};

export const getMetalByKey = (key) => {
    return Object.values(METALS).find(metal => metal.key === key) || null;
};

export const getAllMetals = () => {
    return Object.values(METALS);
}; 