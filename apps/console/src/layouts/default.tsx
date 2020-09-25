/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { RouteInterface } from "@wso2is/core/models";
import {
    ContentLoader,
    DefaultLayout as DefaultLayoutSkeleton,
    TopLoadingBar
} from "@wso2is/react-components";
import React, {
    FunctionComponent,
    ReactElement,
    Suspense,
    SyntheticEvent,
    useEffect,
    useState
} from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import { Responsive } from "semantic-ui-react";
import { Footer, Header, ProtectedRoute } from "../features/core/components";
import { getDefaultLayoutRoutes } from "../features/core/configs";
import { AppConstants, UIConstants } from "../features/core/constants";
import { AppState } from "../features/core/store";

/**
 * Default page layout component Prop types.
 */
export interface DefaultLayoutPropsInterface {
    /**
     * Is layout fluid.
     */
    fluid?: boolean;
}

/**
 * Default page layout.
 *
 * @param {DefaultLayoutPropsInterface} props - Props injected to the default page layout component.
 *
 * @return {React.ReactElement}
 */
export const DefaultLayout: FunctionComponent<DefaultLayoutPropsInterface> = (
    props: DefaultLayoutPropsInterface
): ReactElement => {

    const { fluid } = props;

    const isAJAXTopLoaderVisible: boolean = useSelector((state: AppState) => state.global.isAJAXTopLoaderVisible);

    const [ defaultLayoutRoutes, setDefaultLayoutRoutes ] = useState<RouteInterface[]>(getDefaultLayoutRoutes());
    const [ headerHeight, setHeaderHeight ] = useState<number>(UIConstants.DEFAULT_HEADER_HEIGHT);
    const [ footerHeight, setFooterHeight ] = useState<number>(UIConstants.DEFAULT_FOOTER_HEIGHT);
    const [ isMobileViewport, setIsMobileViewport ] = useState<boolean>(false);

    useEffect(() => {
        if (headerHeight === document.getElementById("app-header")?.offsetHeight) {
            return;
        }
        setHeaderHeight(document.getElementById("app-header")?.offsetHeight - UIConstants.AJAX_TOP_LOADING_BAR_HEIGHT);
    });

    useEffect(() => {
        if (footerHeight === document.getElementById("app-footer")?.offsetHeight) {
            return;
        }
        setFooterHeight(document.getElementById("app-footer")?.offsetHeight);
    });

    /**
     * Listen for base name changes and updated the layout routes.
     */
    useEffect(() => {
        setDefaultLayoutRoutes(getDefaultLayoutRoutes());
    }, [ AppConstants.getTenantQualifiedAppBasename() ]);

    /**
     * Handles the layout on change event.
     *
     * @param {React.SyntheticEvent<HTMLElement>} event - On change event.
     * @param {any} width - Width of the browser window.
     */
    const handleLayoutOnUpdate = (event: SyntheticEvent<HTMLElement>, { width }): void => {
        if (width < Responsive.onlyTablet.minWidth) {
            setIsMobileViewport(true);
            return;
        }

        if (!isMobileViewport) {
            return;
        }

        setIsMobileViewport(false);
    };

    return (
        <DefaultLayoutSkeleton
            fluid={ fluid }
            topLoadingBar={ (
                <TopLoadingBar
                    height={ UIConstants.AJAX_TOP_LOADING_BAR_HEIGHT }
                    visibility={ isAJAXTopLoaderVisible }
                />
            ) }
            footerHeight={ footerHeight }
            headerHeight={ headerHeight }
            desktopContentTopSpacing={ UIConstants.DASHBOARD_LAYOUT_DESKTOP_CONTENT_TOP_SPACING }
            onLayoutOnUpdate={ handleLayoutOnUpdate }
            header={ (
                <Header
                    fluid={ !isMobileViewport ? fluid : false }
                    showSidePanelToggle={ false }
                />
            ) }
            footer={ (
                <Footer
                    showLanguageSwitcher
                    fluid={ !isMobileViewport ? fluid : false }
                />
            ) }
        >
            <Suspense fallback={ <ContentLoader dimmer/> }>
                <Switch>
                    {
                        defaultLayoutRoutes.map((route, index) => (
                            route.redirectTo
                                ? <Redirect to={ route.redirectTo }/>
                                : route.protected
                                ? (
                                    <ProtectedRoute
                                        component={ route.component ? route.component : null }
                                        path={ route.path }
                                        key={ index }
                                        exact={ route.exact }
                                    />
                                )
                                : (
                                    <Route
                                        path={ route.path }
                                        render={ (renderProps) =>
                                            route.component
                                                ? <route.component { ...renderProps } />
                                                : null
                                        }
                                        key={ index }
                                        exact={ route.exact }
                                    />
                                )
                        ))
                    }
                </Switch>
            </Suspense>
        </DefaultLayoutSkeleton>
    );
};

/**
 * Default props for the default layout.
 */
DefaultLayout.defaultProps = {
    fluid: true
};
