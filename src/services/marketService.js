const axios = require('axios');

class MarketService {
    constructor() {
        this.baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
        this.apiKey = process.env.AGMARKNET_API_KEY;
    }

    async getMarketPrices(crop, state = '') {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    'api-key': this.apiKey,
                    format: 'json',
                    limit: 100,
                    filters: {
                        commodity: crop,
                        ...(state && { state: state })
                    }
                }
            });

            return this.processMarketData(response.data);
        } catch (error) {
            console.error('Error fetching market prices:', error);
            throw new Error('Failed to fetch market prices');
        }
    }

    processMarketData(data) {
        return data.records.map(record => ({
            market: record.market,
            crop: record.commodity,
            price: record.modal_price,
            minPrice: record.min_price,
            maxPrice: record.max_price,
            date: record.arrival_date,
            state: record.state,
            district: record.district
        }));
    }

    async getCropList() {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    'api-key': this.apiKey,
                    format: 'json',
                    limit: 1
                }
            });

            return [...new Set(response.data.records.map(record => record.commodity))].sort();
        } catch (error) {
            console.error('Error fetching crop list:', error);
            throw new Error('Failed to fetch crop list');
        }
    }

    async getStateList() {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    'api-key': this.apiKey,
                    format: 'json',
                    limit: 1
                }
            });

            return [...new Set(response.data.records.map(record => record.state))].sort();
        } catch (error) {
            console.error('Error fetching state list:', error);
            throw new Error('Failed to fetch state list');
        }
    }
}

module.exports = new MarketService(); 