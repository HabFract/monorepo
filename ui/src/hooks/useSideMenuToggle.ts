import { useEffect, RefObject } from "react";

const useSideMenuToggle = (
  ref: RefObject<HTMLElement>,
  setSideNavExpanded: Function,
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        event.target.isConnected &&
        !ref.current?.contains(event.target)
      ) {
        setSideNavExpanded(false);
      }
      const domNode = event.target as HTMLElement;
      const iconBtn = !!domNode.closest<HTMLElement>(".toggle-expanded-menu");
      const subMenuSelected = domNode
        .closest<HTMLElement>(".ant-menu-sub")
        ?.classList?.contains("ant-menu-vertical");
      const bottomMenuSelected =
        !!domNode.closest<HTMLElement>(".main-actions-menu");
      const plusSelected = !!domNode.closest<HTMLElement>(
        ".side-nav > .ant-menu-root .ant-menu-item:first-of-type",
      );
      if (!iconBtn && (subMenuSelected || bottomMenuSelected || plusSelected)) {
        removeOtherActiveNavItemStates();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [ref]);

  function removeOtherActiveNavItemStates() {
    [...document.querySelectorAll(".ant-menu-item-selected")]?.forEach((item) =>
      item.classList.remove("ant-menu-item-selected"),
    );
  }
};

export default useSideMenuToggle;
