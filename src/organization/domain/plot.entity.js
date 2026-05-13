/**
 * Represents a Plot (Plota) entity in the application.
 * @remarks
 * This class is used as a domain model for agricultural plots within organizations.
 */

export class Plot {
    /**
     * Creates an instance of the Plot entity.
     * @param {Object} plot - an object containing the properties of the plot.
     * @returns {Plot}
     */
    constructor(plot) {
        this._id = plot.id;
        this._organizationId = plot.organizationId;
        this._name = plot.name;
        this._area = plot.area;
        this._location = plot.location;
        this._crop = plot.crop;
        this._status = plot.status;
        this._createdAt = plot.createdAt;
        this._members = plot.members || [];
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get organizationId() {
        return this._organizationId;
    }

    set organizationId(value) {
        this._organizationId = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get area() {
        return this._area;
    }

    set area(value) {
        this._area = value;
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    get crop() {
        return this._crop;
    }

    set crop(value) {
        this._crop = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }

    get createdAt() {
        return this._createdAt;
    }

    set createdAt(value) {
        this._createdAt = value;
    }

    get members() {
        return this._members;
    }

    set members(members) {
        this._members = members;
    }

    // Domain methods
    addMember(memberId) {
        if (!this._members.includes(memberId)) {
            this._members.push(memberId);
        }
    }

    removeMember(memberId) {
        this._members = this._members.filter(id => id !== memberId);
    }

    isActive() {
        return this._status === PlotStatus.ACTIVE;
    }

    activate() {
        this._status = PlotStatus.ACTIVE;
    }

    deactivate() {
        this._status = PlotStatus.INACTIVE;
    }

    getMemberCount() {
        return this._members.length;
    }

    getAreaNumeric() {
        // Extract numeric value from area string (e.g., "5.2 ha" -> 5.2)
        const match = this._area.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 0;
    }
}

export const PlotStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};
