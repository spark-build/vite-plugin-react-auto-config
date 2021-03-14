{{ #loadingComponent }}
import LoadingComponent from '{{{ loadingComponent }}}';
{{ /loadingComponent }}

{{ #importNameTemplate }}
{{{ importNameTemplate }}}
{{ /importNameTemplate }}

{{ #loadingComponent }}
import dynamic from '@loadable/component';
{{ /loadingComponent }}

export function getRoutes() {
  return {{{ routes }}};
}
