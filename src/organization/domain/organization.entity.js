/**
 * Represents an Organization entity in the application.
 * @remarks
 * This class is used as a domain model for organizations in the agricultural context.
 * It implements the BaseEntity interface to ensure consistency across entities.
 */

export class Organization {
    /**
     * Creates an instance of the Organization entity.
     * @param {Object} organization - an object containing the properties of the organization.
     * @returns {Organization}
     */
    constructor(organization) {
        this._id = organization.id;
        this._name = organization.name;
        this._description = organization.description;
        this._location = organization.location;
        this._members = organization.members || [];
        this._createdAt = organization.createdAt;
        this._agronomistId = organization.agronomistId;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get agronomistId() {
        return this._agronomistId;
    }

    set agronomistId(value) {
        this._agronomistId = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }

    get members() {
        return this._members;
    }

    set members(members) {
        this._members = members;
    }

    get createdAt() {
        return this._createdAt;
    }

    set createdAt(value) {
        this._createdAt = value;
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
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
        return this._status === OrganizationStatus.ACTIVE;
    }

    activate() {
        this._status = OrganizationStatus.ACTIVE;
    }

    deactivate() {
        this._status = OrganizationStatus.INACTIVE;
    }

    getMemberCount() {
        return this._members.length;
    }
}

export const OrganizationStatus = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};
