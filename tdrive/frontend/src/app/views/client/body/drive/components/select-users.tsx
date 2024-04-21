import { useEffect, useRef, useState } from 'react';
import UserBlock from '@molecules/grouped-rows/user';
import { Input } from '@atoms/input/input-text';
import { useSearchUsers } from '@features/users/hooks/use-search-user-list';
import { Button } from '@atoms/button/button';
import { UserType } from '@features/users/types/user';
import { InputDecorationIcon } from '@atoms/input/input-decoration-icon';
import { SearchIcon } from '@heroicons/react/solid';
import { Info } from '@atoms/text';
import Languages from '@features/global/services/languages-service';
import _ from 'lodash';
import { DriveFileAccessLevel } from 'app/features/drive/types';


export default (props: {
  className?: string;
  onChange: (users: UserType[]) => void;
  initialUsers: UserType[];
  level: DriveFileAccessLevel;
}) => {
  const [users, setUsers] = useState<UserType[]>(props.initialUsers);
  const { search, result, query } = useSearchUsers({ scope: 'company' });
  const [isFocus, setFocus] = useState(false);
  const inputElement = useRef<HTMLInputElement>(null);
  const maxUserResultsShown = 5;
  const [selectedUserKey, setSelectedUserKey] = useState('');

  useEffect(() => {
    if (users.length) props.onChange(users);
  }, [users]);

  const shownResults = _.reverse(result.slice(0, maxUserResultsShown));
  const selectedKeyIndex = shownResults.findIndex(({id}) => id === selectedUserKey);

  const moveSelection = (offset: number) => {
    if (selectedKeyIndex === -1) {
      if (offset < 0)
        setSelectedUserKey(shownResults[shownResults.length - 1].id || '');
      else if (offset > 0)
        setSelectedUserKey(shownResults[0].id || '');
    } else {
      const nextIndex = (selectedKeyIndex + shownResults.length + offset) % shownResults.length;
      setSelectedUserKey(shownResults[nextIndex].id || '');
    }
  };
  const doEnterKey = () => {
    const user = shownResults[selectedKeyIndex];
    if (user) {
      setUsers([user]);
      search('');
    }
    setSelectedUserKey('');
  };

  const keyEvents : { [key: string]: () => void } = {
    "ArrowUp": () => moveSelection(-1),
    "ArrowDown": () => moveSelection(1),
    "Enter": () => doEnterKey(),
  };

  return (
    <div className="w-full relative">
      <InputDecorationIcon
        prefix={SearchIcon}
        input={({ className }) => (
          <Input
            onFocus={() => setFocus(true)}
            onBlur={() => {
              setTimeout(() => {
                if (inputElement.current !== document.activeElement) {
                  setFocus(false);
                }
              }, 200);
            }}
            onKeyDown={(e) => {
              if (e.code in keyEvents) {
                keyEvents[e.code]();
                e.preventDefault();
              }
            }}
            placeholder={Languages.t('components.select-users_search_users')}
            className={props.className + ' ' + className + ' w-full'}
            theme="plain"
            onChange={e => {
              search(e.target.value);
              setSelectedUserKey('');
            }}
            inputRef={inputElement}
          />
        )}
      />
      {isFocus && query?.trim() && (
        <div className="absolute w-full end-1 z-10 bg-white dark:bg-zinc-800 dark:text-white rounded-md border shadow-md p-2">
          <div>
            {result.length === 0 && (
              <div className="text-center">
                <Info>{Languages.t('components.user_picker.modal_no_result')}</Info>
              </div>
            )}
            {shownResults.map((user, i) => {
              return (
                <UserBlock
                  key={user.id}
                  user={user}
                  className={
                    "rounded m-1 p-3 new-direct-channel-proposed-user flex flex-row items-center justify-center align-baseline"
                    + (i === selectedKeyIndex ? ' ring' : (i > 0 && i !== (selectedKeyIndex + 1) ? ' border-t' : ''))}
                  suffix={
                    <Button
                      onClick={() => {
                        setUsers([user]);
                        search('');
                        setSelectedUserKey('');
                      }}
                      size="sm"
                    >
                      {Languages.t('components.user_picker.modal.result_add.' + props.level)}
                    </Button>
                  }
                  />
              );
            })}
            {result.length > maxUserResultsShown &&
              <div className='grow text-center italic'>
                {Languages.t('components.user_picker.modal_results_trucated',
                  [maxUserResultsShown, result.length],
                  'First {{$1}} results of {{$2}} shown...')}
              </div>}
            <div className='-mb-px' />
          </div>
        </div>
      )}
    </div>
  );
};
