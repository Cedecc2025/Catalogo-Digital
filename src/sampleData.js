export function getDefaultPortalBaseUrl() {
    if (typeof window === 'undefined') {
        return 'client-portal.html?portal={{slug}}';
    }

    const { origin, pathname } = window.location;
    const sanitizedPath = pathname.replace(/index\.html?$/i, '');
    const basePath = sanitizedPath.endsWith('/') ? sanitizedPath : `${sanitizedPath}/`;
    return `${origin}${basePath}client-portal.html?portal={{slug}}`;
}

export function getInitialDashboardData() {
    return {
        sales: [],
        clients: [],
        products: [],
        inventoryAdjustments: [],
        saleRequests: [],
        portals: [],
        settings: {
            companyName: '',
            companyEmail: '',
            companyPhone: '',
            companyAddress: '',
            tagline: '',
            themeColor: '#6366f1',
            logoUrl: '',
            portalBaseUrl: getDefaultPortalBaseUrl()
        }
    };
}
