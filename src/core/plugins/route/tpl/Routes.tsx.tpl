{{ #loadingComponent }}
import LoadingComponent from '{{{ loadingComponent }}}';
{{ /loadingComponent }}

{{ #loadingComponent }}
import dynamic from '@loadable/component';
{{ /loadingComponent }}

{{ #importNameTemplate }}
{{{ importNameTemplate }}}
{{ /importNameTemplate }}

export function getRoutes() {
  return {{{ routes }}};
}
