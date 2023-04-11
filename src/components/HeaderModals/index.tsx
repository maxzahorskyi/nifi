import TonSurfModal from '../TonSurfModal';
import { TonSurfModalTypes } from '../../utils/TonSurfUtil';
import { Modal } from 'antd';
import classes from '../Header/index.module.scss';
import ArrowIcon from '../../../public/icons/arrowRight.svg';
import React from 'react';
import { useLocales } from '../../hooks/locales';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import useAuthContext from '../../hooks/useAuthContext';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const HeaderModals = ({
  handlers: { setTonSurfOpen, setWarningModal },
  states: { isTonSurfOpen, isWarningModal },
}: Props) => {
  const { hashes, setHashes, setUpdateSession } = useAuthContext();

  const { width, maxMobileWidth } = useWindowDimensions();
  const [title, setTitle] = React.useState<string | undefined>();
  const [linkButtonText, setLinkButtonText] = React.useState<string | undefined>();
  const [body1, setBody1] = React.useState<string | undefined>();
  const [body2, setBody2] = React.useState<string | undefined>();
  const [bullet1, setBullet1] = React.useState<string | undefined>();
  const [bullet2, setBullet2] = React.useState<string | undefined>();
  const [bullet3, setBullet3] = React.useState<string | undefined>();
  const [extratonLink, setExtratonLink] = React.useState<string | undefined>();
  const [everWalletLink, setEverWalletLink] = React.useState<string | undefined>();

  useLocales({
    skipQuery: false,
    variables: {
      query: {
        lang: 'EN',
        module: {
          type: width > maxMobileWidth ? 'desktop' : 'mobile',
          page: 'modal',
          module: 'initialModal',
        },
      },
    },
    onSuccess: (data) => {
      data.forEach((item) => {
        switch (item.stringName) {
          case 'title':
            setTitle(item.string);
            break;

          case 'linkButton':
            setLinkButtonText(item.string);
            break;

          case 'body1':
            setBody1(item.string);
            break;

          case 'body2':
            setBody2(item.string);
            break;

          case 'bullet1':
            setBullet1(item.string);
            break;

          case 'bullet2':
            setBullet2(item.string);
            break;

          case 'bullet3':
            setBullet3(item.string);
            break;

          case 'extratonLink':
            setExtratonLink(item.string);
            break;

          case 'everWalletLink':
            setEverWalletLink(item.string);
            break;

          default:
            break;
        }
      });
    },
    onError: (e) => {
      console.log(e);
    },
  });
  return (
    <>
      {(isTonSurfOpen || (isWarningModal && width < maxMobileWidth)) && (
        <TonSurfModal
          onCancel={() => {
            isWarningModal ? setWarningModal(false) : setTonSurfOpen(false);
          }}
          onSuccess={(hashSecret) => {
            const newHashes = [...(hashes ? hashes : []), hashSecret];
            setHashes(newHashes);
            let surfAddress = '';
            newHashes?.forEach((item, key, arr) => {
              if (arr[key + 1]) {
                surfAddress = `${surfAddress}${item}|`;
              } else {
                surfAddress = `${surfAddress}${item}`;
              }
            });
            cookies.set('surfAddresses', surfAddress, {
              path: '/',
            });
            setUpdateSession(true);
            isWarningModal ? setWarningModal(false) : setTonSurfOpen(false);
          }}
          type={isWarningModal ? TonSurfModalTypes.initialModal : TonSurfModalTypes.authorization}
          isOpen={isTonSurfOpen || (isWarningModal && width < maxMobileWidth)}
        />
      )}
      {isWarningModal && width >= maxMobileWidth && (
        <Modal
          title={title}
          visible={isWarningModal}
          className="modal"
          onOk={() => {
            setWarningModal(false);
          }}
          okButtonProps={{
            style: {
              background: '#D5617D',
              color: '#ffffff',
              border: 'none',
            },
          }}
          okText="OK"
          onCancel={() => {
            setWarningModal(false);
          }}>
          <div className={classes.warningMessage}>
            <p>{body1}</p>
            <ul>
              <li>{bullet1}</li>
            </ul>
            <p>
              <span
                className={classes.TSlink}
                onClick={() => {
                  setTonSurfOpen(true);
                  setWarningModal(false);
                }}>
                <ArrowIcon />
                <span>{linkButtonText}</span>
              </span>
            </p>
            <p>{body2}</p>
            <ul>
              <li>
                {bullet2} -{' '}
                <a target="_blank" href={extratonLink} rel="noreferrer">
                  {extratonLink}
                </a>
              </li>
              <li>
                {bullet3} -{' '}
                <a target="_blank" href={everWalletLink} rel="noreferrer">
                  {everWalletLink}
                </a>
              </li>
            </ul>
          </div>
        </Modal>
      )}
    </>
  );
};

type Props = {
  handlers: {
    setWarningModal: (v: boolean) => void;
    setTonSurfOpen: (v: boolean) => void;
  };
  states: {
    isWarningModal: boolean;
    isTonSurfOpen: boolean;
  };
};

export default HeaderModals;
