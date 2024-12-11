import "../style.css";
import TreeVisIcon from "../icons/TreeVisIcon";

import {
  UnorderedListOutlined,
  AppstoreOutlined,
  PlusCircleOutlined,
  SettingFilled,
} from "@ant-design/icons";
import Menu, { MenuProps } from "antd/es/menu/menu";
import { ReactElement, useEffect, useRef, useState } from "react";
import { getIconSvg, Button as DSButton, Spinner } from "habit-fract-design-system";
import { Sphere, useGetSpheresQuery } from "../../graphql/generated";
import { Button } from "flowbite-react";
import useSideMenuToggle from "../../hooks/useSideMenuToggle";
import { useToast } from "../../contexts/toast";
import { store } from "../../state/store";
import { currentSphereOrbitNodesAtom } from "../../state/orbit";
import { extractEdges } from "../../graphql/utils";
import { ActionHashB64, EntryHashB64 } from "@state/types";
//@ts-ignore
import { ItemType } from "antd/es/menu/hooks/useItems";
import { AppMachine } from "../../main";
import { useAtomValue, useSetAtom } from "jotai";
import {
  currentSphereHasCachedNodesAtom,
  currentSphereHashesAtom,
  sphereHasCachedNodesAtom,
} from "../../state/sphere";
import { currentSphereHierarchyIndices } from "../../state/hierarchy";
import { useStateTransition } from "../../hooks/useStateTransition";

type MenuItem = Required<MenuProps>["items"][number];

enum Page {
  CreateSphere = "CreateSphere",
  ListSpheres = "ListSpheres",
  CreateOrbit = "CreateOrbit",
  ListOrbits = "ListOrbits",
  Dashboard = "Dashboard",
  Vis = "Vis",
  Home = "Home",
}

export interface INav {
  setSideNavExpanded: Function;
  sideNavExpanded: boolean;
}

const Nav: React.FC<INav> = ({
  sideNavExpanded,
  setSideNavExpanded,
}: INav) => {
  const {
    loading: loadingSpheres,
    error,
    data: spheres,
  } = useGetSpheresQuery();
  const [state, transition, params] = useStateTransition(); // Top level state machine and routing

  const [_, setCurrentPage] = useState<Page>(Page.Home);
  const currentPage = AppMachine.state.currentState; // This is more reliable than the hook for tracking updated page state

  const sideMenuRef = useRef(null);
  useSideMenuToggle(sideMenuRef, setSideNavExpanded);

  const setCurrentSphereActionHash = useSetAtom(currentSphereHashesAtom);
  const { showToast, hideToast } = useToast();
  let loading = loadingSpheres || !spheres;

  const spheresArray = loading ? [] : extractEdges(spheres!.spheres) as any;
  const [menuItems, setMenuItems] = useState<ItemType[]>(
    createSphereMenuItems({ spheres: spheresArray }),
  );

  useEffect(() => {
    spheresArray &&
      setMenuItems(createSphereMenuItems({ spheres: spheresArray }));
  }, [spheres, currentPage]);

  store.sub(currentSphereHashesAtom, () => {
    spheresArray &&
      setMenuItems(createSphereMenuItems({ spheres: spheresArray }));
  });
  const sphereOrbitsCached = useAtomValue(currentSphereOrbitNodesAtom);
  const tooltipMsg = `You need to ${spheresArray.length == 0 ? "create" : spheresArray.length >= 4 ? "delete" : "select"} a Space `;

  const sphere = (sphereAh?: EntryHashB64) =>
    spheresArray.find(
      (sphere: any) =>
        (sphereAh || store.get(currentSphereHashesAtom)?.actionHash) ==
        sphere.id,
    ) as Sphere & { id: ActionHashB64 };

  // Main routing logic for menus
  const onClick: MenuProps["onClick"] = (e) => {
    switch (true) {
      case e.key == "add-sphere":
        if (spheresArray.length >= 4) {
          showToast(
            tooltipMsg +
            "before you can add another Space. These are the 4 burners of your habit life!",
          );
          // setSideNavExpanded(true);
          return;
        }
        // setCurrentSphereActionHash({});

        // console.log('reset sphere from nav :>> ');
        // setCurrentPage(Page.CreateSphere);
        setSideNavExpanded(false);
        transition("Onboarding1", { spin: "positive" });
        break;

      case e.key == "list-spheres":
        if (spheresArray.length == 0) {
          // If there is a problem, just show a toast

          showToast(tooltipMsg + "before you can view the Spheres list");
          // setSideNavExpanded(true);
          return;
        }
        setCurrentPage(Page.ListSpheres);
        transition("ListSpheres");

        if (sideNavExpanded) setSideNavExpanded(false);
        break;

      default:
        // Falls through to current Sphere selection context
        // Check conditions where the current page would cause errors for the new Sphere selection
        if ([Page.Vis].includes(currentPage as Page)) {
          if (e.key == store.get(currentSphereHashesAtom).actionHash) {
            // setSideNavExpanded(true);
          } else {
            const checkCachedOrbits = store.get(sphereHasCachedNodesAtom(e.key));
            if (checkCachedOrbits) {

              console.log('set sphere from nav :>> ');
              setCurrentSphereActionHash(e.key);
              setSideNavExpanded(false);
            }
            // if (!checkCachedOrbits) {
            //   showToast(
            //     "Select a Space with Planitts, or create new Planitts before Visualisation.",
            //     100000,
            //   );
            //   return;
            // }
            const transitionParams = {
              currentSphereDetails: sphere(e.key),
              currentSphereEhB64: sphere(e.key)?.eH,
              currentSphereAhB64: e.key,
            };
            transition("Vis", transitionParams);
          }
        } else if ([Page.ListSpheres].includes(currentPage as Page)) {
          if (!(e.key == store.get(currentSphereHashesAtom).actionHash)) {

            console.log('set sphere from nav :>> ');
            setCurrentSphereActionHash(e.key);
          }
          // setSideNavExpanded(true);
        } else {
          hideToast();
          if (store.get(currentSphereHashesAtom)?.actionHash == e.key)
            // setSideNavExpanded(true);
            // Set current sphere from action hash of sphere clicked
            console.log('set sphere from nav :>> ');
          setCurrentSphereActionHash(e.key);

          const pageString = currentPage as string;
          if (currentPage == Page.Home) return;

          // Reload the current page with a new sphere context
          transition(
            pageString,
            pageString == "ListOrbits"
              ? { sphereAh: e.key }
              : pageString == "CreateOrbit"
                ? { sphereEh: sphere(e.key).eH }
                : {
                  currentSphereEhB64: store.get(currentSphereHashesAtom)
                    .entryHash,
                  currentSphereAhB64: e.key,
                },
          );
        }
        break;
    }
  };

  // Helper for buttons that may require menu tooltip state to change
  function buttonWithTooltipHandling(type: string) {
    return (
      <Button
        type="button"
        onClick={(_e) => {
          goToPage(type);
        }}
        disabled={
          spheresArray.length == 0 ||
          !store.get(currentSphereHashesAtom)?.actionHash ||
          (currentPage == Page.Vis && !sphereOrbitsCached)
        }
        className={
          `btn btn-sq btn-${type} ` + (isCurrentPage(type) ? "nohover" : "")
        }
        style={{
          cursor: isCurrentPage(type) ? "initial" : "pointer",
          borderColor: "transparent",
          outlineOffset: "1px",
          outline: isCurrentPage(type) ? "3px solid rgb(17 24 39 / 1)" : "",
        }}
      >
        {getIcon(type)}
      </Button>
    );

    function goToPage(type: string) {
      switch (type) {
        case "neutral":
          hideToast();
          setCurrentPage(Page.ListOrbits);
          transition("ListOrbits", { sphereAh: sphere().id });
          setSideNavExpanded(false);
          return;
        case "primary":
          if (!store.get(currentSphereHasCachedNodesAtom)) {
            showToast(
              "Select a Space with existing Planitts to enable Visualisation",
            );
            return;
          }
          store.set(currentSphereHierarchyIndices, { x: 0, y: 0 });

          setCurrentPage(Page.Vis);
          transition("Vis", {
            currentSphereEhB64: sphere().eH,
            currentSphereAhB64: sphere().id,
          });
          setSideNavExpanded(false);
          return;
        case "secondary":
          hideToast();
          setCurrentPage(Page.CreateOrbit);
          transition("CreateOrbit", { sphereEh: sphere().eH });
          setSideNavExpanded(false);
          return;
      }
    }
    function isCurrentPage(type: string) {
      switch (type) {
        case "neutral":
          return currentPage == Page.ListOrbits;
        case "primary":
          return currentPage == Page.Vis;
        case "secondary":
          return currentPage == Page.CreateOrbit;
      }
    }
    function getIcon(type: string) {
      switch (type) {
        case "neutral":
          return <UnorderedListOutlined />;
        case "primary":
          return <TreeVisIcon />;
        case "secondary":
          return <PlusCircleOutlined />;
      }
    }
  }

  return (
    <>
      <nav
        ref={sideMenuRef}
        className={sideNavExpanded ? "side-nav expanded" : "side-nav off-screen"}
      >
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Menu
              inlineCollapsed={!sideNavExpanded}
              onClick={onClick}
              style={{ width: !sideNavExpanded ? 72 : 256 }}
              mode="inline"
              items={menuItems}
            />
            <div className="off-screen-toggle-button">
              <button type="button" onClick={() => { (sideMenuRef.current as any)?.classList?.toggle("off-screen") }} className="off-screen-icon-button text-text dark:text-text-dark p-2">{getIconSvg('arrow-right')({})}</button>
            </div>
            <div className={"main-actions-menu"}>
              <div
                style={{ display: !sideNavExpanded ? "none" : "flex" }}
                className={"sphere-context-actions"}
                data-tooltip-target="tooltip-left"
                data-tooltip-placement="left"
              >
                {buttonWithTooltipHandling("neutral")}
                {buttonWithTooltipHandling("secondary")}
                {buttonWithTooltipHandling("primary")}
              </div>
              {/* <Menu
                inlineCollapsed={!sideNavExpanded}
                onClick={(e) => onClick(e)}
                style={{ width: !sideNavExpanded ? 72 : 256 }}
                mode="inline"
                items={createFixedMenuItems()}
              /> */}
            </div>
          </>
        )}
      </nav>
    </>
  );

  // Helpers for creating menu items

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group",
    disabled?,
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
      disabled,
    } as MenuItem;
  }

  function createFixedMenuItems() {
    return [
      getItem("Sphere Breakdown", "list-spheres", <AppstoreOutlined />),
      getItem("Settings", "settings", <SettingFilled />),
      // getItem('Dashboard', 'db', <PieChartFilled />, undefined, undefined, true),
    ];
  }
  function createSphereMenuItems({ spheres }: { spheres: Sphere[] }) {
    return [
      spheresArray.length < 4 ? getItem(
        "New Sphere",
        "add-sphere",
        <DSButton onClick={() => { }} variant={"circle-icon btn-primary"} icon={getIconSvg("plus")({}) as ReactElement} />,
        undefined,
        undefined,
        false,
      ) : null,
      ...spheres!.map((sphere: Sphere, _idx: number) => {
        return getItem(
          `${sphere.name}`,
          sphere.id,
          <img
            className={
              store.get(currentSphereHashesAtom)?.actionHash == sphere.id
                ? "selected"
                : ""
            }
            src={sphere.metadata!.image as string}
          />,
        );
      }),
    ];
  }
};

export default Nav;
