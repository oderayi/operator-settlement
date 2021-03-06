'use strict';

const util = require('util');
const Knex = require('knex');

/**
 * Abstracts operations against the database
 */
class Database {
    constructor(config, { logger = () => {} } = {}) {
        this.config = config;
        this.logger = logger;
    }

    /**
     * Connects to the database and returns a self reference
     *
     * @returns {promise} - self-reference
     */
    async connect() {
        // async api means we won't need to refactor if we move to an async model internally
        this.queryBuilder = Knex(this.config);
        this.logger(`Connected to database with config: ${util.inspect(this.config)}`);
        return this;
    }

    /**
     * Check whether the database connection has basic functionality
     *
     * @returns {boolean}
     */
    async isConnected() {
        try {
            const result = await this.queryBuilder.raw('SELECT 1 + 1 AS result');
            if (result) {
                return true;
            }
            return false;
        } catch(err) {
            return false;
        }
    }

    async getSettlementFilesBySettlementId(settlementId) {
        return await this.queryBuilder('settlementFile')
            .where({ settlementId });
    }

    async saveSettlementFile({ settlementId, settlementFile, source }) {
        const settlementFileId = (await this.queryBuilder('settlementFile')
            .insert({
                settlementId,
                settlementFile,
                source,
                state: source
            }))[0];
        return await this.queryBuilder('settlementFile')
            .where({ settlementFileId });
    }
}


module.exports = Database;
